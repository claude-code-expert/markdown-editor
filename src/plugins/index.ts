import type { MarkdownPlugin, EditorState } from "./types";
import { createHeadingPlugins } from "./heading";
import { setextHeading } from "./setextHeading";
import { blockquote } from "./blockquote";
import { bulletList } from "./bulletList";
import { orderedList } from "./orderedList";
import { codeBlock } from "./codeBlock";
import { hr } from "./hr";
import { bold } from "./bold";
import { italic } from "./italic";
import { inlineCode } from "./inlineCode";
import { link } from "./link";
import { image } from "./image";
import { strikethrough } from "./strikethrough";
import { table } from "./table";

/**
 * 레지스트리 — 배열 순서 = 툴바 표시 순서.
 * docs/markdown-editor-spec.md §0 번호순으로 정렬, §0 분류(코어 블록 → 코어 인라인 → GFM)로 그룹.
 * 그룹 경계마다 구분선(plugin.group: block | inline | special). 총 16종.
 * 새 마크다운 태그 추가 = 플러그인 파일 1개 + 여기 1줄. 코어 무수정(헌법 원칙 I).
 */
export const PLUGINS: MarkdownPlugin[] = [
  // ── 그룹 1: 코어 블록 (§0 #1–8) ──
  ...createHeadingPlugins(), // #1 ATX 제목 H1–H3
  setextHeading, // #2 Setext 제목
  blockquote, // #3 인용
  bulletList, // #4 글머리 목록
  orderedList, // #5 번호 목록
  codeBlock, // #6 코드 블록
  hr, // #8 구분선
  // ── 그룹 2: 코어 인라인 (§0 #10–16) ──
  bold, // #10 굵게
  italic, // #11 기울임
  inlineCode, // #13 인라인 코드
  link, // #14 링크
  image, // #16 이미지
  // ── 그룹 3: GFM 확장 ──
  strikethrough, // G1 취소선
  table, // G2 표
];

/** 현재 EditorState에서 활성(isActive=true)인 플러그인 id 배열 (활성표시, 순수 함수). */
export function computeActiveIds(state: EditorState): string[] {
  return PLUGINS.filter((p) => p.isActive?.(state)).map((p) => p.id);
}

export type { MarkdownPlugin } from "./types";
