import { describe, it, expect } from "vitest";
import { PLUGINS, computeActiveIds } from "@/plugins";
import type { MarkdownPlugin, EditorState } from "@/plugins/types";
import { renderMarkdown } from "@/lib/markdown/pipeline";

/**
 * 툴바 통합 테스트 — 전체 플러그인 + 파이프라인을 한 파일에서 엣지케이스까지 통합 검증.
 * 개별 동작·중첩·토글·누락·미동작·아이콘 중복·한글(IME 인접)을 한 번에 본다.
 * 기대값 출처: docs/markdown-editor-spec.md §0.
 */

// 명세 §0 코어+GFM 전 태그 (툴바 커버리지 기준)
const REQUIRED_IDS = [
  "heading-1", "heading-2", "heading-3", "heading-4", "heading-5", "heading-6",
  "setext-heading",
  "bold", "bold-italic", "italic", "strikethrough", "inline-code",
  "link", "reference-link", "autolink", "image",
  "blockquote", "bullet-list", "ordered-list", "task-list",
  "code-block", "table", "hr", "hard-break",
];

// 다이얼로그 플러그인에 적절한 입력 주입
function inputsFor(p: MarkdownPlugin): Record<string, string> | undefined {
  if (!p.dialog) return undefined;
  return Object.fromEntries(
    p.dialog.fields.map((f) => [
      f.key,
      f.key === "url" ? "http://x" : f.key === "id" ? "ref" : "js",
    ]),
  );
}

const sel = (doc: string, a: number, b: number): EditorState => ({
  doc,
  selectionStart: a,
  selectionEnd: b,
});

describe("툴바 무결성", () => {
  it("명세 §0 전 태그가 레지스트리에 등록됨 (누락 0, SC-001)", () => {
    const ids = new Set(PLUGINS.map((p) => p.id));
    expect(REQUIRED_IDS.filter((id) => !ids.has(id))).toEqual([]);
  });

  it("플러그인 id가 유일하다", () => {
    const ids = PLUGINS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("아이콘이 중복되지 않는다 (B 아이콘 2개 회귀 방지)", () => {
    const icons = PLUGINS.map((p) => p.icon);
    const dups = icons.filter((ic, i) => icons.indexOf(ic) !== i);
    expect(dups).toEqual([]);
  });

  it("모든 플러그인이 한글 label·lucide icon·apply 보유", () => {
    for (const p of PLUGINS) {
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.icon).toBeTruthy();
      expect(typeof p.apply).toBe("function");
      expect(["inline", "block", "special"]).toContain(p.group);
    }
  });
});

describe("개별 동작 — 미동작/누락 방지", () => {
  it("전 플러그인이 선택에 대해 doc을 변경한다 (silent no-op 0)", () => {
    for (const p of PLUGINS) {
      const r = p.apply(sel("샘플", 0, 2), inputsFor(p));
      expect(typeof r.doc).toBe("string");
      expect(r.doc).not.toBe("샘플"); // 모든 버튼이 실제로 텍스트를 바꿔야 함
      expect(r.selectionStart).toBeGreaterThanOrEqual(0);
      expect(r.selectionEnd).toBeLessThanOrEqual(r.doc.length);
    }
  });

  it("isActive는 정의 시 boolean을 던지지 않고 반환", () => {
    for (const p of PLUGINS) {
      if (p.isActive) expect(typeof p.isActive(sel("x", 0, 1))).toBe("boolean");
    }
  });
});

describe("토글 (선택 감싸기/줄 접두)", () => {
  const byId = (id: string) => PLUGINS.find((p) => p.id === id)!;

  it("굵게 on→off", () => {
    const on = byId("bold").apply(sel("x", 0, 1));
    expect(on.doc).toBe("**x**");
    const off = byId("bold").apply(sel("**x**", 2, 3));
    expect(off.doc).toBe("x");
  });

  it("인용 줄 접두 on→off", () => {
    const on = byId("blockquote").apply(sel("line", 0, 0));
    expect(on.doc).toBe("> line");
    const off = byId("blockquote").apply(sel("> line", 2, 2));
    expect(off.doc).toBe("line");
  });
});

describe("중첩 (nesting)", () => {
  it("굵은 기울임 *** → <em><strong>", () => {
    expect(renderMarkdown("***강조***").trim()).toContain("<em><strong>강조</strong></em>");
  });

  it("인용 안 목록 렌더", () => {
    const out = renderMarkdown("> - a\n> - b").trim();
    expect(out).toContain("<blockquote>");
    expect(out).toContain("<li>a</li>");
  });

  it("굵게+코드 결합", () => {
    expect(renderMarkdown("**`x`**").trim()).toContain("<strong><code>x</code></strong>");
  });
});

describe("한글 / IME 인접 (멀티문자 선택·렌더)", () => {
  const byId = (id: string) => PLUGINS.find((p) => p.id === id)!;

  it("한글 선택 감싸기 오프셋 정확", () => {
    const r = byId("bold").apply(sel("한글강조", 0, 2));
    expect(r.doc).toBe("**한글**강조");
    expect(r.selectionStart).toBe(2);
    expect(r.selectionEnd).toBe(4);
  });

  it("한글 본문이 파이프라인에서 정확 렌더", () => {
    expect(renderMarkdown("# 제목입니다").trim()).toBe("<h1>제목입니다</h1>");
    expect(renderMarkdown("**굵게** 그리고 *기울임*").trim()).toContain(
      "<strong>굵게</strong>",
    );
  });

  // NOTE: 실제 IME 조합(compositionstart~end) 중 키 입력 처리는 CodeMirror 6 + MarkdownEditor의
  // composition 가드(디바운스 연기) 영역으로, 순수 함수 단위가 아닌 브라우저 통합 검증 대상이다.
});

describe("활성표시 통합 (computeActiveIds)", () => {
  it("커서가 굵게 안 → bold 활성, 평문 → 비활성", () => {
    expect(computeActiveIds(sel("**x**", 2, 3))).toContain("bold");
    expect(computeActiveIds(sel("plain", 2, 3))).not.toContain("bold");
  });
});
