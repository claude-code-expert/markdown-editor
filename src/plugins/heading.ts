import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { toggleHeading, headingActive } from "./helpers";

const ICONS: Record<number, LucideIcon> = {
  1: Heading1,
  2: Heading2,
  3: Heading3,
  4: Heading4,
  5: Heading5,
  6: Heading6,
};

/**
 * 팩토리 — 1파일에서 H1–H6 플러그인 인스턴스 6개 생성(헌법 원칙 I 문서화된 예외).
 * 각 인스턴스는 레지스트리에 개별 등록된다.
 */
export function createHeadingPlugins(): MarkdownPlugin[] {
  return [1, 2, 3, 4, 5, 6].map((level) => ({
    id: `heading-${level}`,
    label: `제목 H${level}`,
    icon: ICONS[level],
    group: "block" as const,
    shortcut: `Mod-${level}`,
    apply: (s) => toggleHeading(s, level),
    isActive: (s) => headingActive(s, level),
  }));
}
