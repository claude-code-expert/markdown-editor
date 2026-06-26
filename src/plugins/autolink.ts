import { Globe } from "lucide-react";
import type { MarkdownPlugin } from "./types";

// 자동 링크 <url> (markdown-editor-spec.md §4.8). 빈 선택 시 <> 삽입 후 커서 가운데.
export const autolink: MarkdownPlugin = {
  id: "autolink",
  label: "자동 링크",
  icon: Globe,
  group: "inline",
  apply: (s) => {
    const { doc, selectionStart, selectionEnd } = s;
    const sel = doc.slice(selectionStart, selectionEnd);
    const md = `<${sel}>`;
    const newDoc = doc.slice(0, selectionStart) + md + doc.slice(selectionEnd);
    return {
      doc: newDoc,
      selectionStart: selectionStart + 1,
      selectionEnd: selectionEnd + 1,
    };
  },
};
