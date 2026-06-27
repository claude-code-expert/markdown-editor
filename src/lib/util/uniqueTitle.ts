/**
 * 동일 폴더 내 중복 제목 → 접미사 부여 (FR-009).
 * 예: existing=["메모","메모-1"], title="메모" → "메모-2". 중복 없으면 원본.
 */
export function uniqueTitle(existing: string[], title: string): string {
  if (!existing.includes(title)) return title;
  let n = 1;
  while (existing.includes(`${title}-${n}`)) n++;
  return `${title}-${n}`;
}
