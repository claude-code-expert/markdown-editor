import { describe, it, expect } from "vitest";
import { uniqueTitle } from "@/lib/util/uniqueTitle";

describe("uniqueTitle (U1–U3, FR-009)", () => {
  it("U1 중복 없으면 원본", () => {
    expect(uniqueTitle(["a", "b"], "c")).toBe("c");
  });
  it("U2 중복 1개 → -1", () => {
    expect(uniqueTitle(["메모"], "메모")).toBe("메모-1");
  });
  it("U3 -1도 있으면 -2", () => {
    expect(uniqueTitle(["메모", "메모-1"], "메모")).toBe("메모-2");
  });
  it("연속 충돌 건너뜀", () => {
    expect(uniqueTitle(["x", "x-1", "x-2"], "x")).toBe("x-3");
  });
});
