import { List } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { toggleLinePrefix, linePrefixActive } from "./helpers";

export const bulletList: MarkdownPlugin = {
  id: "bullet-list",
  label: "글머리 목록",
  icon: List,
  group: "block",
  apply: (s) => toggleLinePrefix(s, "- "),
  isActive: (s) => linePrefixActive(s, "- "),
};
