import { CornerDownLeft } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { insertAtLineEnd } from "./helpers";

// 강제 줄바꿈 — 줄 끝 백슬래시(가시적, spec §4.9 권장).
export const hardBreak: MarkdownPlugin = {
  id: "hard-break",
  label: "줄바꿈",
  icon: CornerDownLeft,
  group: "special",
  apply: (s) => insertAtLineEnd(s, "\\"),
};
