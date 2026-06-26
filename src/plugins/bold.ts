import { Bold } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { wrapSelection, isWrapped } from "./helpers";

export const bold: MarkdownPlugin = {
  id: "bold",
  label: "굵게",
  icon: Bold,
  group: "inline",
  shortcut: "Mod-b",
  apply: (s) => wrapSelection(s, "**"),
  isActive: (s) => isWrapped(s, "**"),
};
