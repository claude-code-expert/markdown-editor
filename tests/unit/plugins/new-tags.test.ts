import { describe, it, expect } from "vitest";
import { boldItalic } from "@/plugins/boldItalic";
import { autolink } from "@/plugins/autolink";
import { hardBreak } from "@/plugins/hardBreak";
import { setextHeading } from "@/plugins/setextHeading";

describe("굵은 기울임 (***)", () => {
  it("감싸기 + isActive 토글", () => {
    expect(boldItalic.apply({ doc: "x", selectionStart: 0, selectionEnd: 1 }).doc).toBe("***x***");
    expect(boldItalic.isActive?.({ doc: "***x***", selectionStart: 3, selectionEnd: 4 })).toBe(true);
  });
});

describe("자동 링크 (<url>)", () => {
  it("선택 감싸기", () => {
    const r = autolink.apply({ doc: "http://x", selectionStart: 0, selectionEnd: 8 });
    expect(r.doc).toBe("<http://x>");
  });
  it("C1 빈 선택 → <> 삽입 후 커서 가운데", () => {
    const r = autolink.apply({ doc: "", selectionStart: 0, selectionEnd: 0 });
    expect(r.doc).toBe("<>");
    expect(r.selectionStart).toBe(1);
    expect(r.selectionEnd).toBe(1);
  });
});

describe("강제 줄바꿈 (\\)", () => {
  it("줄 끝 백슬래시 삽입", () => {
    expect(hardBreak.apply({ doc: "abc", selectionStart: 1, selectionEnd: 1 }).doc).toBe("abc\\");
  });
});

describe("Setext 제목 (밑줄 h1)", () => {
  it("현재 줄 아래 === 추가", () => {
    expect(setextHeading.apply({ doc: "Foo", selectionStart: 0, selectionEnd: 0 }).doc).toBe(
      "Foo\n===",
    );
  });
});
