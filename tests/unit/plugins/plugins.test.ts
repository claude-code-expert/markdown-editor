import { describe, it, expect } from "vitest";
import { PLUGINS } from "@/plugins";
import { bold } from "@/plugins/bold";
import { link } from "@/plugins/link";
import { image } from "@/plugins/image";
import { createHeadingPlugins } from "@/plugins/heading";

describe("플러그인 apply/isActive (C1·C5·C6)", () => {
  it("bold wrap + isActive", () => {
    expect(bold.apply({ doc: "x", selectionStart: 0, selectionEnd: 1 }).doc).toBe("**x**");
    expect(bold.isActive?.({ doc: "**x**", selectionStart: 2, selectionEnd: 3 })).toBe(true);
  });

  it("heading H2 (팩토리)", () => {
    const h2 = createHeadingPlugins()[1];
    expect(h2.id).toBe("heading-2");
    expect(h2.apply({ doc: "t", selectionStart: 0, selectionEnd: 0 }).doc).toBe("## t");
  });

  it("link 다이얼로그 조립 (C5) — v2 다중필드 inputs.url", () => {
    const r = link.apply({ doc: "site", selectionStart: 0, selectionEnd: 4 }, { url: "http://x" });
    expect(r.doc).toBe("[site](http://x)");
  });

  it("image 다이얼로그 조립 (빈 선택 → 대체텍스트) — v2 inputs.url", () => {
    const r = image.apply({ doc: "", selectionStart: 0, selectionEnd: 0 }, { url: "http://img" });
    expect(r.doc).toBe("![대체 텍스트](http://img)");
  });
});

describe("레지스트리 무결성 (C6)", () => {
  it("플러그인 16종 등록 (제목H1–3 + 강조4 + 링크2 + 목록4 + 블록3)", () => {
    expect(PLUGINS).toHaveLength(16);
  });

  it("작업목록(체크리스트) 등록 + 토글 + 체크/미체크 활성", () => {
    const taskList = PLUGINS.find((p) => p.id === "task-list");
    expect(taskList).toBeTruthy();
    expect(
      taskList!.apply({ doc: "할 일", selectionStart: 0, selectionEnd: 0 }).doc,
    ).toBe("- [ ] 할 일");
    expect(
      taskList!.isActive?.({ doc: "- [ ] a", selectionStart: 6, selectionEnd: 6 }),
    ).toBe(true);
    expect(
      taskList!.isActive?.({ doc: "- [x] a", selectionStart: 6, selectionEnd: 6 }),
    ).toBe(true);
  });

  it("모든 플러그인이 한글 label·icon·apply를 가진다", () => {
    for (const p of PLUGINS) {
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.icon).toBeTruthy();
      expect(typeof p.apply).toBe("function");
      expect(["heading", "emphasis", "link", "list", "block"]).toContain(p.group);
    }
  });

  it("id가 유일하다", () => {
    const ids = PLUGINS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
