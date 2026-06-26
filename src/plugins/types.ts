import type { LucideIcon } from "lucide-react";

/**
 * 프레임워크 비종속 에디터 모델 (헌법 원칙 I).
 * CodeMirror·React에 의존하지 않으므로 플러그인은 Vitest로 직접 단위 테스트 가능.
 */
export interface EditorState {
  doc: string;
  selectionStart: number;
  selectionEnd: number;
}

export interface EditorChange {
  doc: string;
  selectionStart: number;
  selectionEnd: number;
}

export type PluginGroup = "inline" | "block" | "special";

/** 다이얼로그 입력 필드 (M2 — 다중필드: 참조링크 id+url, 코드 언어 등) */
export interface DialogField {
  key: string; // 예: "url", "id", "language"
  label: string; // 한글 입력 레이블
  placeholder?: string;
  optional?: boolean;
}

/**
 * 마크다운 태그 1개 = 이 인터페이스를 구현하는 독립 모듈 1개.
 * dialog 선언 시 툴바가 다중필드 다이얼로그로 값을 수집해 apply(state, inputs)로 전달한다.
 */
export interface MarkdownPlugin {
  id: string;
  label: string; // 한글 — aria-label 겸용 (NFR-3)
  icon: LucideIcon;
  group: PluginGroup;
  shortcut?: string;
  dialog?: { fields: DialogField[] }; // 있으면 입력 다이얼로그 경유
  apply(state: EditorState, inputs?: Record<string, string>): EditorChange;
  isActive?(state: EditorState): boolean;
}
