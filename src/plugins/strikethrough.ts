import { Strikethrough } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { wrapSelection, isWrapped } from "./helpers";

// GFM 확장 — remark-gfm 필요
export const strikethrough: MarkdownPlugin = {
  id: "strikethrough",
  label: "취소선",
  icon: Strikethrough,
  group: "inline",
  shortcut: "Mod-Shift-x",
  apply: (s) => wrapSelection(s, "~~"),
  isActive: (s) => isWrapped(s, "~~"),
};
