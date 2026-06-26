import { describe, it, expect } from "vitest";
import { referenceLink } from "@/plugins/referenceLink";

const defs = (doc: string) => (doc.match(/^\[ref1\]:/gm) || []).length;

describe("참조 링크 (R1–R6)", () => {
  it("R1 본문에 [t][id] 삽입", () => {
    const r = referenceLink.apply(
      { doc: "hello world", selectionStart: 0, selectionEnd: 5 },
      { id: "ref1", url: "http://x" },
    );
    expect(r.doc).toContain("[hello][ref1]");
  });

  it("R2 새 id → 하단 정의 1건", () => {
    const r = referenceLink.apply(
      { doc: "x", selectionStart: 0, selectionEnd: 1 },
      { id: "ref1", url: "http://x" },
    );
    expect(r.doc).toContain("[ref1]: http://x");
    expect(defs(r.doc)).toBe(1);
  });

  it("R3 기존 id 정의 → 본문만 삽입, 정의 중복 없음", () => {
    const doc = "본문 [a][ref1]\n\n[ref1]: http://old\n";
    const r = referenceLink.apply(
      { doc, selectionStart: 0, selectionEnd: 0 },
      { id: "ref1", url: "http://new" },
    );
    expect(defs(r.doc)).toBe(1);
  });

  it("R4 빈 선택 → fallback 텍스트", () => {
    const r = referenceLink.apply(
      { doc: "", selectionStart: 0, selectionEnd: 0 },
      { id: "ref1", url: "http://x" },
    );
    expect(r.doc).toContain("[링크 텍스트][ref1]");
  });

  it("R6 순수 — 동일 입력 → 동일 출력", () => {
    const state = { doc: "hi", selectionStart: 0, selectionEnd: 2 };
    const a = referenceLink.apply(state, { id: "ref1", url: "u" });
    const b = referenceLink.apply(state, { id: "ref1", url: "u" });
    expect(a.doc).toBe(b.doc);
  });
});
