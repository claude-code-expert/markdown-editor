import { describe, it, expect } from "vitest";
import { bold } from "@/plugins/bold";
import { link } from "@/plugins/link";
import { image } from "@/plugins/image";

// 계약 진화 회귀 (V1–V3) — M1 플러그인이 다중필드 계약에서도 동일 동작
describe("MarkdownPlugin v2 계약 (V1–V3)", () => {
  it("V1 dialog 없는 플러그인은 apply(state)만으로 동작", () => {
    expect(bold.dialog).toBeUndefined();
    expect(bold.apply({ doc: "x", selectionStart: 0, selectionEnd: 1 }).doc).toBe("**x**");
  });

  it("V2 link은 inputs.url 사용", () => {
    expect(link.dialog?.fields[0].key).toBe("url");
    const r = link.apply({ doc: "site", selectionStart: 0, selectionEnd: 4 }, { url: "http://x" });
    expect(r.doc).toBe("[site](http://x)");
  });

  it("V3 image은 inputs.url 사용", () => {
    const r = image.apply({ doc: "", selectionStart: 0, selectionEnd: 0 }, { url: "http://i" });
    expect(r.doc).toBe("![대체 텍스트](http://i)");
  });
});
