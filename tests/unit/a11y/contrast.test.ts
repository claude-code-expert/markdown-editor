import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  contrastRatio,
  meetsAA,
  relativeLuminance,
} from "@/lib/a11y/contrast";

/**
 * 색 대비 — 텍스트로 쓰이는 디자인 토큰쌍이 WCAG AA(4.5:1) 이상인지 검증(FR-007·SC-005).
 * globals.css 실값을 파싱해 단일 출처로 삼는다 — T003 토큰 수정이 그대로 반영된다.
 * 점 인디케이터(--ok 등 aria-hidden 장식)는 텍스트가 아니므로 제외(contracts/accessibility.md A4).
 */

const CSS = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");

function token(name: string): string {
  const m = CSS.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,6})`));
  if (!m) throw new Error(`globals.css에 --${name} 정의 없음`);
  return m[1];
}

describe("WCAG 대비 — 순수 함수", () => {
  it("흰/검 대비는 21:1", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 0);
  });
  it("동일색 대비는 1:1", () => {
    expect(contrastRatio("#3b5bdb", "#3b5bdb")).toBeCloseTo(1, 5);
  });
  it("상대휘도: 흰=1, 검=0", () => {
    expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(relativeLuminance("#000000")).toBeCloseTo(0, 5);
  });
});

describe("디자인 토큰 — 텍스트 대비 AA", () => {
  const bg = () => token("bg");

  it("--fg(본문)는 배경 대비 AA", () => {
    expect(meetsAA(token("fg"), bg())).toBe(true);
  });
  it("--fg-muted(보조)는 배경 대비 AA", () => {
    expect(meetsAA(token("fg-muted"), bg())).toBe(true);
  });
  it("--fg-faint(상태·카운트·라벨)는 배경 대비 AA", () => {
    // 감사 시점 #98a1b2 ≈ 2.6:1 → RED. T003에서 상향 후 GREEN.
    expect(meetsAA(token("fg-faint"), bg())).toBe(true);
  });
  it("저장 버튼: --accent-fg on --accent는 AA", () => {
    expect(meetsAA(token("accent-fg"), token("accent"))).toBe(true);
  });
  it("--danger(실패 토스트 의미색)가 정의되어 있다", () => {
    expect(() => token("danger")).not.toThrow();
  });
});
