import { SquareCode } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { insertBlock } from "./helpers";

// 코드 블록 — 언어 지정(선택) 시 ```lang, 미지정 시 ``` (FR-008). 프리뷰는 언어 클래스 보존(M1).
export const codeBlock: MarkdownPlugin = {
  id: "code-block",
  label: "코드 블록",
  icon: SquareCode,
  group: "block",
  dialog: {
    fields: [
      { key: "language", label: "언어", placeholder: "js, python …", optional: true },
    ],
  },
  apply: (s, inputs) => {
    const lang = (inputs?.language ?? "").trim();
    return insertBlock(s, "```" + lang + "\n\n```");
  },
};
