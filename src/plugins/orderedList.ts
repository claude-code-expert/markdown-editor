import { ListOrdered } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { toggleLinePrefix, linePrefixActive } from "./helpers";

export const orderedList: MarkdownPlugin = {
  id: "ordered-list",
  label: "번호 목록",
  icon: ListOrdered,
  group: "list",
  apply: (s) => toggleLinePrefix(s, "1. "),
  isActive: (s) => linePrefixActive(s, "1. "),
};
