import { Type } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { wrapSelection, isWrapped } from "./helpers";

// 굵은 기울임 ***텍스트*** → <em><strong> (markdown-editor-spec.md §4.3)
// lucide에 bold+italic 결합 글리프가 없어 Type(텍스트 서식) 아이콘으로 bold와 구분(중복 방지).
export const boldItalic: MarkdownPlugin = {
  id: "bold-italic",
  label: "굵은 기울임",
  icon: Type,
  group: "inline",
  shortcut: "Mod-Shift-b",
  apply: (s) => wrapSelection(s, "***"),
  isActive: (s) => isWrapped(s, "***"),
};
