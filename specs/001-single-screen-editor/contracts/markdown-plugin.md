# Contract: MarkdownPlugin 인터페이스 (헌법 원칙 I)

툴바 버튼 1개 = 마크다운 태그 1개 = `src/plugins/<tag>.ts` 독립 파일 1개. 전부 이 계약을 구현하고
`plugins/index.ts` 레지스트리 배열에 1줄 등록한다. **코어(Toolbar/MarkdownEditor)는 무수정.**

## 타입 (`src/plugins/types.ts`)

```typescript
import type { LucideIcon } from "lucide-react";

export interface EditorState {            // 프레임워크 비종속
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

export interface MarkdownPlugin {
  id: string;
  label: string;        // 한글 — aria-label 겸용(NFR-3)
  icon: LucideIcon;
  group: PluginGroup;
  shortcut?: string;    // 예: "Mod-b"
  apply(state: EditorState): EditorChange;   // 순수 함수 — 부수효과 금지
  isActive?(state: EditorState): boolean;    // 토글 표시
}
```

## 계약 규칙 (테스트 가능)

| # | 규칙 | 검증(Vitest) |
|---|------|-------------|
| C1 | `apply`는 순수 함수 — 동일 입력 → 동일 출력, CM6/React/DOM 미참조 | fixture `EditorState` → `EditorChange` 단언 |
| C2 | 선택 없음(start==end) 시 빈 마커 삽입 + 커서를 마커 사이로 | `**\|**` 커서 위치 단언 |
| C3 | wrap 토글: 이미 감싼 선택에 재적용 → 마커 제거(이중적용 금지) | `**x**`→`x` 단언 |
| C4 | line-prefix 토글: 접두 존재 시 제거, 다중 줄 선택은 각 줄 적용 | `## x`↔`x`, 멀티라인 |
| C5 | dialog 타입(링크·이미지)은 `apply`가 URL 인자를 받는 형태로 분리, `isActive` 없음 | 조립 결과 `[t](u)` |
| C6 | `label`은 한글, `icon`은 lucide, `group` 정확 | 레지스트리 정적 검사 |

## 동작 타입 ↔ 헬퍼 (`src/plugins/helpers.ts`)

| 타입 | 헬퍼 | 플러그인 | 토글 |
|------|------|----------|------|
| 선택 감싸기 | `wrapSelection(state, marker)` | bold, italic, strikethrough, inlineCode | O |
| 줄 접두 | `toggleLinePrefix(state, prefix)` | heading(H1–H6), blockquote, bulletList, orderedList, taskList | O |
| 블록 삽입 | `insertBlock(state, template)` | codeBlock, hr, table | △ |
| 입력 다이얼로그 | (LinkDialog → apply에 url 전달) | link, image | X |

## M1 플러그인 목록 (spec FR-005)

`heading`(팩토리 →H1..H6), `bold`, `italic`, `strikethrough`(GFM), `inlineCode`, `codeBlock`,
`link`, `image`, `blockquote`, `bulletList`, `orderedList`, `taskList`(GFM), `table`(GFM), `hr`.

문법·HTML 기대값·토글 규칙 출처: `docs/markdown-editor-spec.md §0·§2·§3`.

## 레지스트리 (`src/plugins/index.ts`)

```typescript
export const PLUGINS: MarkdownPlugin[] = [
  ...createHeadingPlugins(),   // H1..H6
  bold, italic, strikethrough, inlineCode,
  link, image,
  blockquote, bulletList, orderedList, taskList,
  codeBlock, table, hr,
];   // 배열 순서 = 툴바 표시 순서. 새 태그 = 여기 1줄 추가.
```

Toolbar는 `PLUGINS`를 순회 렌더할 뿐 개별 플러그인을 알지 못한다(격리 불변식).
