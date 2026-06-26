# Contract: MarkdownPlugin v2 (다중필드 입력 + 활성표시)

M1 계약을 진화. 기존 단일 입력 플러그인은 호환 유지(단일 필드로 이전).

## 타입 (`src/plugins/types.ts` 확장)

```typescript
export interface DialogField {
  key: string;          // 예: "url", "id", "language"
  label: string;        // 한글 — 입력 레이블
  placeholder?: string;
  optional?: boolean;
}

export interface MarkdownPlugin {
  id: string;
  label: string;        // 한글 aria-label
  icon: LucideIcon;
  group: PluginGroup;
  shortcut?: string;
  dialog?: { fields: DialogField[] };   // 있으면 툴바가 다이얼로그로 값 수집
  apply(state: EditorState, inputs?: Record<string, string>): EditorChange;  // 다중필드
  isActive?(state: EditorState): boolean;
}
```

## 계약 규칙 (테스트 가능)

| # | 규칙 | 검증 |
|---|------|------|
| V1 | `dialog` 없는 플러그인은 `apply(state)`만으로 동작(기존과 동일) | bold 등 회귀 |
| V2 | `dialog.fields` 선언 플러그인은 `apply(state, inputs)`에서 `inputs[key]` 사용 | link `inputs.url` |
| V3 | M1 link/image 이전: `inputs.url` 단일 필드로 동작 동일 | `[t](u)`·`![a](u)` |
| V4 | 활성표시: `isActive` 참인 플러그인 id가 `activeIds`에 포함 | 커서를 `**x**` 내부 → bold 활성 |
| V5 | 선택 변경 시 `activeIds` 재계산(평문 이동 → 해제) | 상태 전이 단언 |
| V6 | 신규 태그 추가가 파서·CM 어댑터 무수정으로 됨(파일+레지스트리 1줄) | 구조 검사 |

## 활성표시 표면

- `MarkdownEditor`: CM `updateListener`(selection 포함) → `EditorState` → `PLUGINS` 중
  `isActive` 참인 id 배열 → `store.setActiveIds`.
- `Toolbar`: `activeIds` 구독 → 해당 버튼에 활성 스타일(액센트 배경/색, anti-slop 준수).

## 신규 플러그인 (각 파일 1개 + index.ts 1줄)

| id | label | 동작 | dialog |
|----|-------|------|--------|
| `bold-italic` | 굵은 기울임 | wrap `***` (토글) | — |
| `reference-link` | 참조 링크 | 본문 `[t][id]` + 하단 `[id]: url` | `id`, `url` |
| `autolink` | 자동 링크 | wrap `<`…`>` | — |
| `hard-break` | 줄바꿈 | 줄 끝 `\` 삽입 | — |
| `setext-heading` | 제목(밑줄) | 다음 줄 `===`/`---` | — |

기대값·문법 출처: `docs/markdown-editor-spec.md §3.2·§4.3·§4.8·§4.9·§7`.
