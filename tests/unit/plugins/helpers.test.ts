import { describe, it, expect } from "vitest";
import {
  wrapSelection,
  isWrapped,
  toggleLinePrefix,
  linePrefixActive,
  toggleHeading,
  headingActive,
  insertBlock,
} from "@/plugins/helpers";

describe("wrapSelection (C2·C3)", () => {
  it("선택 영역 감싸기", () => {
    const r = wrapSelection({ doc: "hello", selectionStart: 0, selectionEnd: 5 }, "**");
    expect(r.doc).toBe("**hello**");
    expect(r.selectionStart).toBe(2);
    expect(r.selectionEnd).toBe(7);
  });

  it("바깥 마커 토글 해제", () => {
    const r = wrapSelection({ doc: "**hello**", selectionStart: 2, selectionEnd: 7 }, "**");
    expect(r.doc).toBe("hello");
  });

  it("선택 내부 마커 토글 해제", () => {
    const r = wrapSelection({ doc: "**hi**", selectionStart: 0, selectionEnd: 6 }, "**");
    expect(r.doc).toBe("hi");
  });

  it("빈 선택 → 빈 쌍 + 커서 가운데", () => {
    const r = wrapSelection({ doc: "", selectionStart: 0, selectionEnd: 0 }, "**");
    expect(r.doc).toBe("****");
    expect(r.selectionStart).toBe(2);
    expect(r.selectionEnd).toBe(2);
  });

  it("isWrapped 판정", () => {
    expect(isWrapped({ doc: "**x**", selectionStart: 2, selectionEnd: 3 }, "**")).toBe(true);
    expect(isWrapped({ doc: "x", selectionStart: 0, selectionEnd: 1 }, "**")).toBe(false);
  });
});

describe("toggleLinePrefix (C4)", () => {
  it("단일 줄 접두 추가/제거", () => {
    const add = toggleLinePrefix({ doc: "line", selectionStart: 0, selectionEnd: 0 }, "> ");
    expect(add.doc).toBe("> line");
    const remove = toggleLinePrefix({ doc: "> line", selectionStart: 2, selectionEnd: 2 }, "> ");
    expect(remove.doc).toBe("line");
  });

  it("다중 줄 접두", () => {
    const r = toggleLinePrefix({ doc: "a\nb", selectionStart: 0, selectionEnd: 3 }, "> ");
    expect(r.doc).toBe("> a\n> b");
  });

  it("linePrefixActive", () => {
    expect(linePrefixActive({ doc: "- x", selectionStart: 0, selectionEnd: 3 }, "- ")).toBe(true);
  });
});

describe("toggleHeading", () => {
  it("추가 / 같은 레벨 해제 / 다른 레벨 교체", () => {
    expect(toggleHeading({ doc: "t", selectionStart: 0, selectionEnd: 0 }, 2).doc).toBe("## t");
    expect(toggleHeading({ doc: "## t", selectionStart: 0, selectionEnd: 0 }, 2).doc).toBe("t");
    expect(toggleHeading({ doc: "# t", selectionStart: 0, selectionEnd: 0 }, 2).doc).toBe("## t");
  });

  it("headingActive", () => {
    expect(headingActive({ doc: "## t", selectionStart: 0, selectionEnd: 0 }, 2)).toBe(true);
    expect(headingActive({ doc: "## t", selectionStart: 0, selectionEnd: 0 }, 1)).toBe(false);
  });
});

describe("insertBlock", () => {
  it("빈 문서 줄머리에 블록 삽입", () => {
    const r = insertBlock({ doc: "", selectionStart: 0, selectionEnd: 0 }, "---");
    expect(r.doc).toBe("---\n");
  });

  it("줄 중간이면 새 줄 확보", () => {
    const r = insertBlock({ doc: "abc", selectionStart: 3, selectionEnd: 3 }, "---");
    expect(r.doc).toBe("abc\n---\n");
  });
});
