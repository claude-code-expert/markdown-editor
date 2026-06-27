import type { MarkdownPlugin, EditorState } from "./types";
import { createHeadingPlugins } from "./heading";
import { bold } from "./bold";
import { italic } from "./italic";
import { strikethrough } from "./strikethrough";
import { inlineCode } from "./inlineCode";
import { link } from "./link";
import { image } from "./image";
import { blockquote } from "./blockquote";
import { bulletList } from "./bulletList";
import { orderedList } from "./orderedList";
import { codeBlock } from "./codeBlock";
import { table } from "./table";
import { hr } from "./hr";

/**
 * 레지스트리 — 배열 순서 = 툴바 표시 순서. 그룹(heading·emphasis·link·list·block) 경계마다 구분선.
 * 새 마크다운 태그 추가 = 플러그인 파일 1개 작성 + 여기 1줄 추가. 코어 무수정(헌법 원칙 I).
 * 2026-06-27 변경: 제목 H1–H3 / 링크 단일화 / 작업목록·Setext·굵은기울임·자동링크·줄바꿈 제외.
 */
export const PLUGINS: MarkdownPlugin[] = [
  // 제목
  ...createHeadingPlugins(), // H1–H3
  // 강조/서식
  bold,
  italic,
  strikethrough,
  inlineCode,
  // 링크/이미지
  link,
  image,
  // 목록/인용
  blockquote,
  bulletList,
  orderedList,
  // 블록
  codeBlock,
  table,
  hr,
];

/** 현재 EditorState에서 활성(isActive=true)인 플러그인 id 배열 (활성표시, 순수 함수). */
export function computeActiveIds(state: EditorState): string[] {
  return PLUGINS.filter((p) => p.isActive?.(state)).map((p) => p.id);
}

export type { MarkdownPlugin } from "./types";
