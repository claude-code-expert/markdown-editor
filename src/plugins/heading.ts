import { Heading1, Heading2, Heading3 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { toggleHeading, headingActive } from "./helpers";

const ICONS: Record<number, LucideIcon> = {
  1: Heading1,
  2: Heading2,
  3: Heading3,
};

/**
 * 팩토리 — H1–H3 플러그인 인스턴스 생성(헌법 원칙 I 문서화된 예외).
 * H4–H6은 글자 크기 구분이 약해 툴바에서 제외(2026-06 스펙 변경). 각 인스턴스는 레지스트리에 개별 등록.
 */
export function createHeadingPlugins(): MarkdownPlugin[] {
  return [1, 2, 3].map((level) => ({
    id: `heading-${level}`,
    label: `제목 H${level}`,
    icon: ICONS[level],
    group: "block" as const,
    shortcut: `Mod-${level}`,
    apply: (s) => toggleHeading(s, level),
    isActive: (s) => headingActive(s, level),
  }));
}
