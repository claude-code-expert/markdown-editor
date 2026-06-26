import { describe, it, expect } from "vitest";
import { PLUGINS } from "@/plugins";
import { bold } from "@/plugins/bold";
import { bulletList } from "@/plugins/bulletList";
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

  it("bulletList 줄 접두", () => {
    expect(bulletList.apply({ doc: "todo", selectionStart: 0, selectionEnd: 0 }).doc).toBe(
      "- todo",
    );
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
  it("플러그인 16종 등록 (§0 번호순, 굵은기울임·자동링크·줄바꿈 추가 제외)", () => {
    expect(PLUGINS).toHaveLength(16);
  });

  it("모든 플러그인이 한글 label·icon·apply를 가진다", () => {
    for (const p of PLUGINS) {
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.icon).toBeTruthy();
      expect(typeof p.apply).toBe("function");
      expect(["inline", "block", "special"]).toContain(p.group);
    }
  });

  it("id가 유일하다", () => {
    const ids = PLUGINS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
