import { describe, it, expect } from "vitest";
import { setextHeading } from "@/plugins/setextHeading";

// 굵은기울임·자동링크·강제줄바꿈은 2026-06-27 툴바 제외(플러그인 삭제). Setext만 잔존.
describe("Setext 제목 (밑줄 h1)", () => {
  it("현재 줄 아래 === 추가", () => {
    expect(setextHeading.apply({ doc: "Foo", selectionStart: 0, selectionEnd: 0 }).doc).toBe(
      "Foo\n===",
    );
  });
});
