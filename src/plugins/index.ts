import type { MarkdownPlugin, EditorState } from "./types";
import { createHeadingPlugins } from "./heading";
import { setextHeading } from "./setextHeading";
import { bold } from "./bold";
import { boldItalic } from "./boldItalic";
import { italic } from "./italic";
import { strikethrough } from "./strikethrough";
import { inlineCode } from "./inlineCode";
import { link } from "./link";
import { referenceLink } from "./referenceLink";
import { autolink } from "./autolink";
import { image } from "./image";
import { blockquote } from "./blockquote";
import { bulletList } from "./bulletList";
import { orderedList } from "./orderedList";
import { taskList } from "./taskList";
import { codeBlock } from "./codeBlock";
import { table } from "./table";
import { hr } from "./hr";
import { hardBreak } from "./hardBreak";

/**
 * 레지스트리 — 배열 순서 = 툴바 표시 순서.
 * 새 마크다운 태그 추가 = 플러그인 파일 1개 작성 + 여기 1줄 추가. 코어 무수정(헌법 원칙 I).
 */
export const PLUGINS: MarkdownPlugin[] = [
  ...createHeadingPlugins(), // H1–H6 (block)
  setextHeading, // block
  bold, // inline
  boldItalic,
  italic,
  strikethrough,
  inlineCode,
  link,
  referenceLink,
  autolink,
  image,
  blockquote, // block
  bulletList,
  orderedList,
  taskList,
  codeBlock, // special
  table,
  hr,
  hardBreak,
];

/** 현재 EditorState에서 활성(isActive=true)인 플러그인 id 배열 (US2 활성표시, 순수 함수). */
export function computeActiveIds(state: EditorState): string[] {
  return PLUGINS.filter((p) => p.isActive?.(state)).map((p) => p.id);
}

export type { MarkdownPlugin } from "./types";
