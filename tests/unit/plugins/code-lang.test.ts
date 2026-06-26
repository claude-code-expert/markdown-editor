import { describe, it, expect } from "vitest";
import { codeBlock } from "@/plugins/codeBlock";

describe("코드 블록 언어 지정 (FR-008)", () => {
  it("언어 지정 → ```lang 펜스", () => {
    const r = codeBlock.apply({ doc: "", selectionStart: 0, selectionEnd: 0 }, { language: "python" });
    expect(r.doc).toContain("```python");
  });
  it("언어 미지정 → ``` (기존 동작)", () => {
    const r = codeBlock.apply({ doc: "", selectionStart: 0, selectionEnd: 0 });
    expect(r.doc).toContain("```\n");
    expect(r.doc).not.toContain("```undefined");
  });
});
