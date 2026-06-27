import { Quote } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { toggleLinePrefix, linePrefixActive } from "./helpers";

export const blockquote: MarkdownPlugin = {
  id: "blockquote",
  label: "인용",
  icon: Quote,
  group: "list",
  apply: (s) => toggleLinePrefix(s, "> "),
  isActive: (s) => linePrefixActive(s, "> "),
};
