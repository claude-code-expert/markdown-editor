/** 문자수·줄수 계산 (FR-016). 순수 함수 — 상태바가 구독해 표시. */
export function countChars(doc: string): number {
  return doc.length;
}

export function countLines(doc: string): number {
  return doc.length === 0 ? 1 : doc.split("\n").length;
}

export function countDoc(doc: string): { chars: number; lines: number } {
  return { chars: countChars(doc), lines: countLines(doc) };
}
