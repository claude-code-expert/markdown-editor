import type { MarkdownPlugin } from "@/plugins";
import type { EditorChange } from "@/plugins/types";

/** 툴바·단축키가 에디터에 작용하는 명령 표면. MarkdownEditor가 구현(useImperativeHandle). */
export interface EditorController {
  applyPlugin: (plugin: MarkdownPlugin, inputs?: Record<string, string>) => void;
  /** 현재 doc·커서 위치에 임의 문서 연산 적용(표 편집 등). 순수 함수 op(doc, pos) → EditorChange */
  applyDocOp: (op: (doc: string, pos: number) => EditorChange) => void;
  isActive: (plugin: MarkdownPlugin) => boolean;
  /** 에디터 스크롤 엘리먼트(CM scrollDOM) — 스크롤 동기화용(M4) */
  getScroller: () => HTMLElement | null;
  focus: () => void;
}
