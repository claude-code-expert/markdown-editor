import { describe, it, expect } from "vitest";
import { scrollRatio, targetScrollTop, canScroll } from "@/lib/scroll/syncScroll";

describe("스크롤 동기화 순수 함수 (Y1–Y5)", () => {
  it("Y1 scrollRatio = scrollTop / (scrollHeight - clientHeight)", () => {
    expect(scrollRatio({ scrollTop: 50, scrollHeight: 200, clientHeight: 100 })).toBe(0.5);
  });

  it("Y1 분모 0 이하 → 0", () => {
    expect(scrollRatio({ scrollTop: 0, scrollHeight: 100, clientHeight: 100 })).toBe(0);
    expect(scrollRatio({ scrollTop: 0, scrollHeight: 80, clientHeight: 100 })).toBe(0);
  });

  it("Y2 targetScrollTop = ratio * (scrollHeight - clientHeight)", () => {
    expect(targetScrollTop(0.5, { scrollHeight: 200, clientHeight: 100 })).toBe(50);
  });

  it("Y3 canScroll", () => {
    expect(canScroll({ scrollHeight: 200, clientHeight: 100 })).toBe(true);
    expect(canScroll({ scrollHeight: 100, clientHeight: 100 })).toBe(false);
  });

  it("Y4 경계 r=0 → 0, r=1 → 최대", () => {
    const el = { scrollHeight: 300, clientHeight: 100 };
    expect(targetScrollTop(0, el)).toBe(0);
    expect(targetScrollTop(1, el)).toBe(200);
  });

  it("Y5 A→B round-trip 비율 일치", () => {
    const a = { scrollTop: 80, scrollHeight: 500, clientHeight: 100 }; // ratio 0.2
    const b = { scrollHeight: 1000, clientHeight: 200 }; // max 800
    const top = targetScrollTop(scrollRatio(a), b);
    expect(scrollRatio({ ...b, scrollTop: top })).toBeCloseTo(scrollRatio(a), 5);
  });
});
