import type { EditorChange } from "@/plugins/types";

/**
 * GFM 표 편집 순수 연산 (contracts/table-ops.md). 프레임워크 비종속 → Vitest 단위 테스트.
 * 표는 MarkdownPlugin 태그가 아니라 컨텍스트 의존 코어 기능이므로 plugins/가 아닌 lib/에 둔다(F1).
 */
export type Align = "none" | "left" | "center" | "right";

function isSep(line: string): boolean {
  const t = line.trim();
  return t.includes("|") && t.includes("-") && /^[\s|:-]+$/.test(t);
}
function parseRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}
function serializeRow(cells: string[]): string {
  return "| " + cells.join(" | ") + " |";
}
function sepCell(align: Align): string {
  switch (align) {
    case "left":
      return ":---";
    case "center":
      return ":---:";
    case "right":
      return "---:";
    default:
      return "---";
  }
}

function lineOffsets(lines: string[]): number[] {
  const offsets: number[] = [];
  let acc = 0;
  for (const l of lines) {
    offsets.push(acc);
    acc += l.length + 1;
  }
  return offsets;
}

interface Block {
  lines: string[];
  startLine: number;
  endLine: number;
  allLines: string[];
}

function getBlock(doc: string, pos: number): Block | null {
  const allLines = doc.split("\n");
  const offsets = lineOffsets(allLines);
  let lineIdx = 0;
  for (let i = 0; i < allLines.length; i++) {
    if (pos >= offsets[i]) lineIdx = i;
    else break;
  }
  if (!allLines[lineIdx]?.includes("|")) return null;
  let start = lineIdx;
  let end = lineIdx;
  while (start > 0 && allLines[start - 1].includes("|")) start--;
  while (end < allLines.length - 1 && allLines[end + 1].includes("|")) end++;
  const lines = allLines.slice(start, end + 1);
  if (lines.length < 2 || !isSep(lines[1])) return null;
  return { lines, startLine: start, endLine: end, allLines };
}

function commit(b: Block, newBlock: string[], pos: number): EditorChange {
  const next = [
    ...b.allLines.slice(0, b.startLine),
    ...newBlock,
    ...b.allLines.slice(b.endLine + 1),
  ];
  const doc = next.join("\n");
  const caret = Math.min(pos, doc.length);
  return { doc, selectionStart: caret, selectionEnd: caret };
}

function noop(doc: string, pos: number): EditorChange {
  return { doc, selectionStart: pos, selectionEnd: pos };
}

export function isInTable(doc: string, pos: number): boolean {
  return getBlock(doc, pos) !== null;
}

/** 커서가 속한 표의 열 인덱스(0-base). 표 밖이면 -1. */
export function currentColumn(doc: string, pos: number): number {
  const b = getBlock(doc, pos);
  if (!b) return -1;
  const allLines = doc.split("\n");
  const offsets = lineOffsets(allLines);
  let lineIdx = 0;
  for (let i = 0; i < allLines.length; i++) {
    if (pos >= offsets[i]) lineIdx = i;
    else break;
  }
  const col = pos - offsets[lineIdx];
  const before = allLines[lineIdx].slice(0, col);
  const pipes = (before.match(/\|/g) || []).length;
  return Math.max(0, pipes - 1);
}

export function addRow(doc: string, pos: number): EditorChange {
  const b = getBlock(doc, pos);
  if (!b) return noop(doc, pos);
  const cols = parseRow(b.lines[0]).length;
  const newRow = serializeRow(Array(cols).fill(" "));
  return commit(b, [...b.lines, newRow], pos);
}

export function addColumn(doc: string, pos: number): EditorChange {
  const b = getBlock(doc, pos);
  if (!b) return noop(doc, pos);
  const newBlock = b.lines.map((line, idx) => {
    const cells = parseRow(line);
    if (idx === 1) cells.push("---");
    else if (idx === 0) cells.push("헤더");
    else cells.push(" ");
    return serializeRow(cells);
  });
  return commit(b, newBlock, pos);
}

export function setColumnAlign(
  doc: string,
  pos: number,
  colIndex: number,
  align: Align,
): EditorChange {
  const b = getBlock(doc, pos);
  if (!b) return noop(doc, pos);
  const newBlock = b.lines.map((line, idx) => {
    if (idx !== 1) return line;
    const cells = parseRow(line);
    if (colIndex < 0 || colIndex >= cells.length) return line;
    cells[colIndex] = sepCell(align);
    return serializeRow(cells);
  });
  return commit(b, newBlock, pos);
}
