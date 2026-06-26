import { Minus } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { insertBlock } from "./helpers";

export const hr: MarkdownPlugin = {
  id: "hr",
  label: "구분선",
  icon: Minus,
  group: "block",
  apply: (s) => insertBlock(s, "---"),
};
