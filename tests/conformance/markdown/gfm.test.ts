import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown/pipeline";

// 기대값 출처: docs/markdown-editor-spec.md §0 GFM 확장 (remark-gfm 필요)
const html = (md: string) => renderMarkdown(md).trim();

describe("GFM 확장 conformance (P3)", () => {
  it("취소선", () => {
    expect(html("~~s~~")).toBe("<p><del>s</del></p>");
  });

  it("표 (정렬/구조 보존)", () => {
    const out = html("| a | b |\n| --- | --- |\n| 1 | 2 |");
    expect(out).toContain("<table>");
    expect(out).toContain("<th>a</th>");
    expect(out).toContain("<td>1</td>");
  });

  it("작업 목록 (체크박스 보존)", () => {
    const out = html("- [x] done");
    expect(out).toContain('type="checkbox"');
    expect(out).toContain("checked");
    const open = html("- [ ] todo");
    expect(open).toContain('type="checkbox"');
    expect(open).not.toContain("checked");
  });

  it("자동 링크 리터럴", () => {
    expect(html("www.example.com")).toContain('href="http://www.example.com"');
  });
});
