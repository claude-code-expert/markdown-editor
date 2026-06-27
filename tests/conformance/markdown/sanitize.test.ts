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

// M7(FR-009·S2) — 페이로드 셋 확장 회귀 고정. 모두 무력화되어야 한다.
describe("Sanitize XSS 방어 — 확장 페이로드 (M7)", () => {
  it("iframe 제거", () => {
    const out = renderMarkdown('<iframe src="https://evil.test"></iframe>');
    expect(out).not.toContain("<iframe");
  });

  it("svg onload 핸들러 제거", () => {
    const out = renderMarkdown('<svg onload="alert(1)"></svg>');
    expect(out).not.toContain("onload");
  });

  it("data: 프로토콜 링크 제거", () => {
    const out = renderMarkdown(
      "[x](data:text/html,<script>alert(1)</script>)",
    );
    expect(out).not.toContain("data:text/html");
  });

  it("style 태그 제거", () => {
    const out = renderMarkdown("<style>body{display:none}</style>");
    expect(out).not.toContain("<style");
  });

  it("object/embed 제거", () => {
    const out = renderMarkdown('<object data="x.swf"></object>');
    expect(out).not.toContain("<object");
  });

  it("onclick 인라인 핸들러 제거", () => {
    const out = renderMarkdown('<a href="#" onclick="alert(1)">x</a>');
    expect(out).not.toContain("onclick");
  });
});
