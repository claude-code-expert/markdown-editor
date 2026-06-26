import { Code } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { wrapSelection, isWrapped } from "./helpers";

export const inlineCode: MarkdownPlugin = {
  id: "inline-code",
  label: "인라인 코드",
  icon: Code,
  group: "inline",
  shortcut: "Mod-e",
  apply: (s) => wrapSelection(s, "`"),
  isActive: (s) => isWrapped(s, "`"),
};
