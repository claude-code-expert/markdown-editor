import { describe, it, expect } from "vitest";
import { insertAtLineEnd, appendReferenceDef } from "@/plugins/helpers";

describe("insertAtLineEnd (하드브레이크)", () => {
  it("현재 줄 끝에 마커 삽입", () => {
    expect(insertAtLineEnd({ doc: "abc", selectionStart: 1, selectionEnd: 1 }, "\\").doc).toBe(
      "abc\\",
    );
  });
  it("다음 줄이 있으면 그 줄 끝에", () => {
    expect(insertAtLineEnd({ doc: "a\nb", selectionStart: 0, selectionEnd: 0 }, "\\").doc).toBe(
      "a\\\nb",
    );
  });
});

describe("appendReferenceDef (참조 정의 수집)", () => {
  it("새 id → 하단에 정의 추가", () => {
    expect(appendReferenceDef("본문", "ref1", "http://x")).toBe("본문\n\n[ref1]: http://x\n");
  });
  it("기존 id 정의 존재 → 추가 안 함(재사용)", () => {
    const doc = "본문\n\n[ref1]: http://old\n";
    expect(appendReferenceDef(doc, "ref1", "http://new")).toBe(doc);
  });
});
