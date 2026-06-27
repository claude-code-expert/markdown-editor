/**
 * WCAG 2.1 대비비 계산 — 순수 함수(프레임워크 비종속, 헌법 IV TDD).
 * 색 대비는 접근성 요구(FR-007). 텍스트 토큰쌍이 AA(4.5:1)를 만족하는지 검증에 사용.
 */

/** `#rrggbb` → [r,g,b] (0–255). 3자리 단축형도 허용. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) throw new Error(`잘못된 hex: ${hex}`);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

/** sRGB 채널(0–255) → 선형화 (WCAG 상대휘도 공식). */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** 상대휘도 L (0=검정 ~ 1=흰색). */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** 두 색의 대비비 (1:1 ~ 21:1). 인자 순서 무관. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG AA 일반 텍스트 기준(4.5:1) 충족 여부. */
export function meetsAA(a: string, b: string): boolean {
  return contrastRatio(a, b) >= 4.5;
}
