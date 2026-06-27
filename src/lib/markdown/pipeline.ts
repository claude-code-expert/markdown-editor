import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

/**
 * Sanitize 스키마 (헌법 원칙 II — 생략 불가).
 * 기본 GitHub 스키마 + GFM 산출 보존:
 *  - 작업목록 체크박스 input[type=checkbox][checked][disabled]
 *  - 표 정렬 th/td[align|style]
 *  - 코드 언어 클래스 code[className]
 * script·on*·javascript: 등 위험 요소는 기본 스키마가 계속 차단.
 */
const schema = {
  ...defaultSchema,
  tagNames: Array.from(new Set([...(defaultSchema.tagNames ?? []), "input"])),
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className"],
    input: [
      ...(defaultSchema.attributes?.input ?? []),
      "type",
      "checked",
      "disabled",
    ],
    th: [...(defaultSchema.attributes?.th ?? []), "align", "style"],
    td: [...(defaultSchema.attributes?.td ?? []), "align", "style"],
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
  },
};

/**
 * 파이프라인 순서 = 보안 결정(헌법 원칙 II).
 * sanitize를 highlight보다 먼저 둔다: 사용자 HTML을 먼저 정제한 뒤,
 * 신뢰된 하이라이터(lowlight/highlight.js)가 hljs-* span을 주입한다.
 * highlight 산출은 신뢰 출력이라 재정제 불필요하고, sanitize 스키마에
 * 토큰 클래스를 일일이 허용할 필요도 없다(code[className]만으로 language-* 전달).
 * highlight는 동기 변환이므로 renderMarkdown의 processSync를 유지한다(Shiki=async라 부적합).
 * 미등록 언어(```foobar)는 v7 기본 동작상 throw 없이 무하이라이트로 통과(경고만) → 프리뷰 안전.
 * 기본 detect:false → 언어 미지정 블록은 자동추정하지 않고 그대로 둔다(오추정 방지).
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, schema)
  .use(rehypeHighlight)
  .use(rehypeStringify);

/** 마크다운 → 정제된 안전 HTML 문자열. 모든 단계가 동기이므로 processSync 사용. */
export function renderMarkdown(md: string): string {
  return String(processor.processSync(md));
}
