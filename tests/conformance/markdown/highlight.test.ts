import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown/pipeline";

// 코드 구문 하이라이트 — rehype-highlight(sanitize 뒤 적용). 동기 파이프라인 유지.
describe("코드 하이라이트 (rehype-highlight)", () => {
  it("언어 지정 펜스 코드블록에 hljs 토큰 클래스가 주입된다", () => {
    const out = renderMarkdown("```js\nconst x = 1;\n```");
    expect(out).toContain('class="hljs language-js"');
    // 최소 한 종류 이상의 토큰이 강조되어야 한다.
    expect(out).toMatch(/hljs-(keyword|number|title|string)/);
  });

  it("미등록 언어는 throw 없이 무하이라이트로 통과한다", () => {
    expect(() => renderMarkdown("```foobar\nx\n```")).not.toThrow();
    const out = renderMarkdown("```foobar\nx\n```");
    expect(out).toContain("<code");
    expect(out).not.toContain("hljs-keyword");
  });

  it("언어 미지정 블록은 자동추정하지 않는다(detect:false)", () => {
    const out = renderMarkdown("```\nplain text\n```");
    expect(out).not.toContain("hljs-");
  });

  it("인라인 코드는 하이라이트되지 않는다", () => {
    const out = renderMarkdown("문장 안의 `code`.");
    expect(out).not.toContain("hljs-");
  });

  it("하이라이트 추가 후에도 sanitize는 유지된다(순서 불변)", () => {
    const out = renderMarkdown("```js\n// safe\n```\n\n<script>alert(1)</script>");
    expect(out).not.toContain("<script");
    expect(out).toContain("hljs");
  });
});
