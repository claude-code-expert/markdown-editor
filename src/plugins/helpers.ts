import type { EditorState, EditorChange } from "./types";

/** 선택 영역이 marker로 감싸였는지(바깥쪽 또는 선택 내부 포함) */
export function isWrapped(state: EditorState, marker: string): boolean {
  const { doc, selectionStart: s, selectionEnd: e } = state;
  const m = marker.length;
  const before = doc.slice(Math.max(0, s - m), s);
  const after = doc.slice(e, e + m);
  if (before === marker && after === marker) return true;
  const sel = doc.slice(s, e);
  if (sel.length >= m * 2 && sel.startsWith(marker) && sel.endsWith(marker)) return true;
  return false;
}

/** 선택 감싸기(토글). 빈 선택이면 빈 쌍 삽입 후 커서를 가운데로. (굵게·기울임·코드·취소선) */
export function wrapSelection(state: EditorState, marker: string): EditorChange {
  const { doc, selectionStart: s, selectionEnd: e } = state;
  const m = marker.length;

  // 바깥쪽 마커 → 해제
  const before = doc.slice(Math.max(0, s - m), s);
  const after = doc.slice(e, e + m);
  if (before === marker && after === marker) {
    const newDoc = doc.slice(0, s - m) + doc.slice(s, e) + doc.slice(e + m);
    return { doc: newDoc, selectionStart: s - m, selectionEnd: e - m };
  }

  // 선택 내부에 마커 포함 → 해제
  const sel = doc.slice(s, e);
  if (sel.length >= m * 2 && sel.startsWith(marker) && sel.endsWith(marker)) {
    const inner = sel.slice(m, sel.length - m);
    const newDoc = doc.slice(0, s) + inner + doc.slice(e);
    return { doc: newDoc, selectionStart: s, selectionEnd: s + inner.length };
  }

  // 빈 선택 → 빈 쌍, 커서 가운데
  if (s === e) {
    const newDoc = doc.slice(0, s) + marker + marker + doc.slice(e);
    return { doc: newDoc, selectionStart: s + m, selectionEnd: s + m };
  }

  // 감싸기
  const newDoc = doc.slice(0, s) + marker + sel + marker + doc.slice(e);
  return { doc: newDoc, selectionStart: s + m, selectionEnd: e + m };
}

function lineBounds(doc: string, s: number, e: number) {
  const start = doc.lastIndexOf("\n", s - 1) + 1;
  let end = doc.indexOf("\n", e);
  if (end === -1) end = doc.length;
  return { start, end };
}

/** 선택이 걸친 모든 줄이 prefix로 시작하는지 */
export function linePrefixActive(state: EditorState, prefix: string): boolean {
  const { doc, selectionStart: s, selectionEnd: e } = state;
  const { start, end } = lineBounds(doc, s, e);
  const lines = doc.slice(start, end).split("\n");
  return lines.every((l) => l.startsWith(prefix));
}

/** 줄 접두 토글. 모든 줄이 prefix면 제거, 아니면 추가. (인용·목록·작업목록) */
export function toggleLinePrefix(state: EditorState, prefix: string): EditorChange {
  const { doc, selectionStart: s, selectionEnd: e } = state;
  const { start, end } = lineBounds(doc, s, e);
  const block = doc.slice(start, end);
  const lines = block.split("\n");
  const allHave = lines.every((l) => l.startsWith(prefix));
  const newLines = allHave
    ? lines.map((l) => l.slice(prefix.length))
    : lines.map((l) => prefix + l);
  const newBlock = newLines.join("\n");
  const delta = newBlock.length - block.length;
  const newDoc = doc.slice(0, start) + newBlock + doc.slice(end);
  const shift = allHave ? -prefix.length : prefix.length;
  return {
    doc: newDoc,
    selectionStart: Math.max(start, s + shift),
    selectionEnd: e + delta,
  };
}

const ATX = /^(#{1,6})\s+/;

function currentLine(doc: string, pos: number) {
  const start = doc.lastIndexOf("\n", pos - 1) + 1;
  let end = doc.indexOf("\n", pos);
  if (end === -1) end = doc.length;
  return { start, end, text: doc.slice(start, end) };
}

/** 제목 토글: 같은 레벨이면 해제, 다른 레벨이면 교체, 없으면 추가. */
export function toggleHeading(state: EditorState, level: number): EditorChange {
  const prefix = "#".repeat(level) + " ";
  const { doc, selectionStart: s, selectionEnd: e } = state;
  const { start, end, text } = currentLine(doc, s);
  const m = text.match(ATX);
  let newLine: string;
  if (m && m[1].length === level) newLine = text.slice(m[0].length);
  else if (m) newLine = prefix + text.slice(m[0].length);
  else newLine = prefix + text;
  const delta = newLine.length - text.length;
  const newDoc = doc.slice(0, start) + newLine + doc.slice(end);
  return { doc: newDoc, selectionStart: s + delta, selectionEnd: e + delta };
}

export function headingActive(state: EditorState, level: number): boolean {
  const { text } = currentLine(state.doc, state.selectionStart);
  const m = text.match(ATX);
  return !!m && m[1].length === level;
}

/** 블록 삽입: 빈 줄을 확보해 멀티라인 구조 삽입. (코드블록·구분선·표) */
export function insertBlock(state: EditorState, template: string): EditorChange {
  const { doc, selectionStart: s } = state;
  const atLineStart = s === 0 || doc[s - 1] === "\n";
  const insertText = (atLineStart ? "" : "\n") + template + "\n";
  const newDoc = doc.slice(0, s) + insertText + doc.slice(s);
  const caret = s + insertText.length;
  return { doc: newDoc, selectionStart: caret, selectionEnd: caret };
}

/** 다이얼로그 조립: 선택 텍스트(없으면 fallback) + URL → 마크다운 삽입. (링크·이미지) */
export function buildDialogInsert(
  state: EditorState,
  build: (text: string, url: string) => string,
  fallbackText: string,
  url: string,
): EditorChange {
  const { doc, selectionStart: s, selectionEnd: e } = state;
  const text = doc.slice(s, e) || fallbackText;
  const md = build(text, url);
  const newDoc = doc.slice(0, s) + md + doc.slice(e);
  const caret = s + md.length;
  return { doc: newDoc, selectionStart: caret, selectionEnd: caret };
}

/** 현재 줄 끝에 마커 삽입 (강제 줄바꿈 `\`). */
export function insertAtLineEnd(state: EditorState, marker: string): EditorChange {
  const { doc, selectionStart: s } = state;
  let lineEnd = doc.indexOf("\n", s);
  if (lineEnd === -1) lineEnd = doc.length;
  const newDoc = doc.slice(0, lineEnd) + marker + doc.slice(lineEnd);
  const caret = lineEnd + marker.length;
  return { doc: newDoc, selectionStart: caret, selectionEnd: caret };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 참조 링크 정의를 문서 하단에 추가. 동일 식별자 정의가 이미 있으면 추가하지 않고 원본 반환(재사용).
 * 순수 함수 — (doc, id, url) → doc.
 */
export function appendReferenceDef(doc: string, id: string, url: string): string {
  const re = new RegExp("^\\[" + escapeRegExp(id) + "\\]:\\s", "m");
  if (re.test(doc)) return doc;
  const sep = doc.length === 0 ? "" : doc.endsWith("\n\n") ? "" : doc.endsWith("\n") ? "\n" : "\n\n";
  return doc + sep + `[${id}]: ${url}\n`;
}
