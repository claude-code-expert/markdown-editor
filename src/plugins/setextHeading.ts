import { Heading } from "lucide-react";
import type { MarkdownPlugin } from "./types";

// Setext 제목(밑줄형, h1) — 현재 줄 아래에 === 추가 (markdown-editor-spec.md §3.2).
export const setextHeading: MarkdownPlugin = {
  id: "setext-heading",
  label: "제목(밑줄)",
  icon: Heading,
  group: "block",
  apply: (s) => {
    const { doc, selectionStart, selectionEnd } = s;
    const lineStart = doc.lastIndexOf("\n", selectionStart - 1) + 1;
    let lineEnd = doc.indexOf("\n", selectionStart);
    if (lineEnd === -1) lineEnd = doc.length;
    const lineLen = lineEnd - lineStart;
    const underline = "=".repeat(Math.max(3, lineLen));
    const insert = "\n" + underline;
    const newDoc = doc.slice(0, lineEnd) + insert + doc.slice(lineEnd);
    return {
      doc: newDoc,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
    };
  },
};
