import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown/pipeline";

// 헌법 원칙 II / SC-005 / P4 — 정제 생략 불가
describe("Sanitize XSS 방어 (P4·SC-005)", () => {
  it("script 태그 제거", () => {
    const out = renderMarkdown("<script>alert(1)</script>");
    expect(out).not.toContain("<script");
    expect(out).not.toContain("alert(1)</script>");
  });

  it("이벤트 핸들러 속성(onerror) 제거", () => {
    const out = renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain("onerror");
  });

  it("javascript: 프로토콜 링크 제거", () => {
    const out = renderMarkdown("[x](javascript:alert(1))");
    expect(out).not.toContain("javascript:");
  });

  it("정상 마크다운은 보존", () => {
    const out = renderMarkdown("**ok**");
    expect(out).toContain("<strong>ok</strong>");
  });
});
