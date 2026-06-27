import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown/pipeline";

/**
 * 성능 — 렌더 예산(FR-002·SC-001 보조) + 비선형 폭증 회귀 고정(contracts/performance.md P3).
 * 절대 ms는 환경 의존(analyze A1)이라 하드 임계 대신 **관대한 상한 + 스케일링 가드**로 단언.
 * 프레임 단위 체감(P2)·IME(P4)는 quickstart 수동 — 여기서 측정하지 않음(no silent cap).
 */

/** n자 분량의 현실적 마크다운(헤딩·목록·강조·코드 혼합)을 생성. */
function genMarkdown(targetChars: number): string {
  const block = [
    "## 섹션 제목",
    "본문 문단 **굵게** 그리고 *기울임* 그리고 `inline code` 포함.",
    "- 목록 항목 하나",
    "- 목록 항목 둘",
    "",
    "> 인용문 한 줄",
    "",
    "```js",
    "const x = 1;",
    "```",
    "",
  ].join("\n");
  let out = "";
  while (out.length < targetChars) out += block + "\n";
  return out.slice(0, targetChars);
}

function timeRender(md: string): number {
  const t0 = performance.now();
  renderMarkdown(md);
  return performance.now() - t0;
}

describe("렌더 예산", () => {
  it("1만 자 문서를 비어있지 않은 HTML로 렌더한다", () => {
    const html = renderMarkdown(genMarkdown(10_000));
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("<h2");
  });

  it("1만 자 렌더가 관대한 상한(1000ms) 내에 끝난다", () => {
    // 실측은 수십 ms 수준. 상한은 CI 환경 변동 흡수용 sanity ceiling.
    expect(timeRender(genMarkdown(10_000))).toBeLessThan(1000);
  });

  it("입력 10배 증가가 렌더 시간을 비선형 폭증시키지 않는다", () => {
    const t1k = Math.max(timeRender(genMarkdown(1_000)), 0.5); // 0 division 방지 floor
    const t10k = timeRender(genMarkdown(10_000));
    // 선형이면 ~10배. O(n log n) 여유 + 노이즈 감안해 30배를 상한으로.
    expect(t10k).toBeLessThan(t1k * 30);
  });
});
