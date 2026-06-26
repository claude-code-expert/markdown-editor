import { Italic } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { wrapSelection, isWrapped } from "./helpers";

export const italic: MarkdownPlugin = {
  id: "italic",
  label: "기울임",
  icon: Italic,
  group: "inline",
  shortcut: "Mod-i",
  apply: (s) => wrapSelection(s, "*"),
  isActive: (s) => isWrapped(s, "*"),
};
