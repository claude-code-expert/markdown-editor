import { ListTodo } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { toggleLinePrefix, linePrefixActive } from "./helpers";

// GFM 확장 — remark-gfm 필요
export const taskList: MarkdownPlugin = {
  id: "task-list",
  label: "작업 목록",
  icon: ListTodo,
  group: "block",
  apply: (s) => toggleLinePrefix(s, "- [ ] "),
  isActive: (s) => linePrefixActive(s, "- [ ] "),
};
