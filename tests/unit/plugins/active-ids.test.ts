import { describe, it, expect } from "vitest";
import { computeActiveIds } from "@/plugins";

describe("computeActiveIds (V4·V5 활성표시)", () => {
  it("V4 굵게 구간 안 커서 → bold 활성", () => {
    const ids = computeActiveIds({ doc: "**x**", selectionStart: 2, selectionEnd: 3 });
    expect(ids).toContain("bold");
  });

  it("V5 평문 → bold 비활성", () => {
    const ids = computeActiveIds({ doc: "plain", selectionStart: 2, selectionEnd: 3 });
    expect(ids).not.toContain("bold");
  });

  it("제목 줄 → 해당 레벨 활성", () => {
    const ids = computeActiveIds({ doc: "## t", selectionStart: 3, selectionEnd: 3 });
    expect(ids).toContain("heading-2");
  });

  it("C2 성능 — 큰 문서에서 즉시(<50ms)", () => {
    const big = "lorem ipsum dolor sit amet\n".repeat(10000);
    const t0 = performance.now();
    computeActiveIds({ doc: big, selectionStart: 1000, selectionEnd: 1000 });
    expect(performance.now() - t0).toBeLessThan(50);
  });
});
