import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown/pipeline";

// 기대값 출처: docs/markdown-editor-spec.md §0 CommonMark 0.31.2 코어
const html = (md: string) => renderMarkdown(md).trim();

describe("CommonMark 코어 conformance (P2)", () => {
  it("ATX 제목 H1–H6", () => {
    expect(html("# foo")).toBe("<h1>foo</h1>");
    expect(html("###### foo")).toBe("<h6>foo</h6>");
  });

  it("굵게 / 기울임 / 굵은 기울임", () => {
    expect(html("**bold**")).toBe("<p><strong>bold</strong></p>");
    expect(html("*it*")).toBe("<p><em>it</em></p>");
    expect(html("***x***")).toContain("<em><strong>x</strong></em>");
  });

  it("인라인 코드", () => {
    expect(html("`code`")).toBe("<p><code>code</code></p>");
  });

  it("인용구", () => {
    const out = html("> quote");
    expect(out).toContain("<blockquote>");
    expect(out).toContain("<p>quote</p>");
  });

  it("순서 없는 / 있는 목록", () => {
    expect(html("- a")).toContain("<ul>");
    expect(html("- a")).toContain("<li>a</li>");
    expect(html("1. a")).toContain("<ol>");
  });

  it("펜스 코드 블록 (언어 클래스 보존)", () => {
    const out = html("```js\ncode\n```");
    expect(out).toContain("<pre><code");
    expect(out).toContain("language-js");
  });

  it("구분선", () => {
    expect(html("---")).toBe("<hr>");
  });

  it("인라인 링크", () => {
    expect(html("[t](http://x.com)")).toBe('<p><a href="http://x.com">t</a></p>');
  });
});
