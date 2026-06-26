import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
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

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize, schema)
  .use(rehypeStringify);

/** 마크다운 → 정제된 안전 HTML 문자열. 모든 단계가 동기이므로 processSync 사용. */
export function renderMarkdown(md: string): string {
  return String(processor.processSync(md));
}
