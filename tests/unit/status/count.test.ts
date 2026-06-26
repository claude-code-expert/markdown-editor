import { describe, it, expect } from "vitest";
import { countChars, countLines, countDoc } from "@/lib/util/count";

describe("문자수·줄수 (FR-016)", () => {
  it("문자수", () => {
    expect(countChars("hello")).toBe(5);
    expect(countChars("")).toBe(0);
  });

  it("줄수", () => {
    expect(countLines("a\nb\nc")).toBe(3);
    expect(countLines("one line")).toBe(1);
    expect(countLines("")).toBe(1);
  });

  it("countDoc 결합", () => {
    expect(countDoc("a\nb")).toEqual({ chars: 3, lines: 2 });
  });
});
