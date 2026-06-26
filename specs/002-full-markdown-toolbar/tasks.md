---
description: "Task list — 플러그인 완성 전체 마크다운 툴바 (M2)"
---

# Tasks: 플러그인 완성 — 전체 마크다운 툴바 (M2)

**Input**: Design documents from `specs/002-full-markdown-toolbar/`

**Prerequisites**: plan.md, spec.md (필수) · research.md · data-model.md · contracts/ · quickstart.md

**Tests**: 포함함(헌법 원칙 IV TDD). 신규 플러그인·tableOps·referenceLink·computeActiveIds를 순수
함수로 RED 선작성. 기대값 출처 `docs/markdown-editor-spec.md`.

**Organization**: User Story별 페이즈. M1(완료) 위에 확장. 각 스토리 독립 테스트 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능(다른 파일, 미완 의존 없음)
- **[Story]**: US1~US4 (spec.md 매핑)
- 경로는 기존 M1 트리(`src/`)에 추가/확장

---

## Phase 1: Setup

**Purpose**: M2 착수 기준선 확인(신규 의존성 없음)

- [x] T001 M1 그린 베이스라인 확인 — `npm test`(44 통과) + `npm run build` 성공 재확인 후 M2 착수

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 계약 진화(다중필드 다이얼로그) — US1·US3가 의존. 완료 전 해당 스토리 시작 불가

**⚠️ CRITICAL**: apply 시그니처 마이그레이션이라 M1 회귀 없이 끝나야 함

- [x] T002 [P] 계약 진화 RED 테스트 `tests/unit/plugins/contract-v2.test.ts` — V1(dialog 없는 플러그인 기존 동작)·V2(`inputs[key]` 사용)·V3(link/image `inputs.url` 동등) 단언(먼저 실패)
- [x] T003 타입 확장 `src/plugins/types.ts` — `DialogField`, `dialog?: { fields: DialogField[] }`, `apply(state, inputs?: Record<string,string>)` (contracts/plugin-contract-v2.md)
- [x] T004 [P] M1 link/image 이전 `src/plugins/{link,image}.ts` — `apply(s, inputs)` → `inputs.url` 사용, `dialog.fields=[{key:"url",label:"URL"}]`
- [x] T005 다중필드 다이얼로그 `src/components/editor/Dialog.tsx` — `dialog.fields` 순회 렌더·값 수집(LinkDialog 일반화), 한글 aria(FR-013). 기존 LinkDialog 대체
- [x] T006 호출부 진화 `src/components/editor/controller.ts` + `MarkdownEditor.tsx` — `applyPlugin(plugin, inputs?: Record<string,string>)`, CM keymap·EditorScreen 다이얼로그 연결 갱신 (T002 통과)

**Checkpoint**: 계약 진화 완료, M1 회귀 0 — 신규 입력형 태그 추가 가능

---

## Phase 3: User Story 1 - 모든 마크다운 태그를 툴바로 삽입 (Priority: P1) 🎯 MVP

**Goal**: 누락 태그 5종(굵은기울임·참조링크·자동링크·강제줄바꿈·Setext) 툴바 완성

**Independent Test**: 각 신규 버튼이 올바른 문법 삽입 + 프리뷰 정확 렌더(quickstart W1·W2·W4·W5·W6)

### Tests for User Story 1 (RED 먼저) ⚠️

- [x] T007 [P] [US1] 헬퍼 테스트 `tests/unit/plugins/helpers-v2.test.ts` — `insertAtLineEnd`(하드브레이크), `appendReferenceDef`(참조정의 추가·중복재사용)
- [x] T008 [P] [US1] 신규 플러그인 테스트 `tests/unit/plugins/new-tags.test.ts` — boldItalic(`***` 토글)·autolink(`<url>`)·hardBreak·setextHeading apply 단언(기대값 markdown-editor-spec.md §3.2·§4.8·§4.9)
- [x] T009 [P] [US1] 참조 링크 테스트 `tests/unit/plugins/reference-link.test.ts` — R1~R6(본문 삽입·정의 1건·중복 재사용·fallback·순수)

### Implementation for User Story 1

- [x] T010 [US1] 헬퍼 확장 `src/plugins/helpers.ts` — `insertAtLineEnd(state, marker)`, `appendReferenceDef(doc, id, url)` (T007 통과)
- [x] T011 [P] [US1] 굵은 기울임 `src/plugins/boldItalic.ts` — wrap `***`, isActive
- [x] T012 [P] [US1] 자동 링크 `src/plugins/autolink.ts` — `<`…`>` 감싸기
- [x] T013 [P] [US1] 강제 줄바꿈 `src/plugins/hardBreak.ts` — 줄 끝 `\` 삽입
- [x] T014 [P] [US1] Setext 제목 `src/plugins/setextHeading.ts` — 다음 줄 `===`/`---`
- [x] T015 [US1] 참조 링크 `src/plugins/referenceLink.ts` — `[t][id]` 삽입 + 하단 정의(`dialog.fields=[id,url]`), 전체 doc 순수함수 (T009 통과)
- [x] T016 [US1] 레지스트리 등록 `src/plugins/index.ts` — 신규 5종 각 1줄 추가(코어 무수정, 헌법 I 검증)

**Checkpoint**: 명세의 전 마크다운 태그를 툴바로 삽입 가능

---

## Phase 4: User Story 2 - 적용된 서식을 툴바에서 시각 확인 (Priority: P1)

**Goal**: 커서/선택이 서식 구간 안이면 해당 버튼 활성 표시, 실시간 갱신

**Independent Test**: `**굵게**` 안 커서 → 굵게 버튼 활성, 평문 이동 → 해제(W7·W8)

### Tests for User Story 2 (RED 먼저) ⚠️

- [x] T017 [P] [US2] 활성 계산 테스트 `tests/unit/plugins/active-ids.test.ts` — `computeActiveIds(state)`가 `isActive` 참인 플러그인 id 배열 반환(V4·V5, 커서 위치별)

### Implementation for User Story 2

- [x] T018 [US2] 활성 계산 순수함수 `src/plugins/index.ts`(또는 `activeIds.ts`) — `computeActiveIds(state): string[] = PLUGINS.filter(p=>p.isActive?.(state)).map(id)` (T017 통과)
- [x] T019 [US2] 스토어 확장 `src/lib/store/useEditorStore.ts` — `activeIds: string[]`, `setActiveIds(ids)`
- [x] T020 [US2] 선택 브리지 `src/components/editor/MarkdownEditor.tsx` — CM `updateListener`가 selection 변경 시 `computeActiveIds` → `setActiveIds`(SC-002 즉시)
- [x] T021 [US2] 툴바 활성 표시 `src/components/editor/Toolbar.tsx` — `activeIds` 구독, 포함 버튼에 활성 스타일(액센트, anti-slop 준수)

**Checkpoint**: 서식 활성 표시 실시간 동작

---

## Phase 5: User Story 3 - 코드 블록에 언어 지정 (Priority: P2)

**Goal**: 코드 블록 삽입 시 언어 지정 → 프리뷰 언어 클래스 반영

**Independent Test**: 코드블록 → "python" → ` ```python ` 삽입 + 프리뷰 언어 클래스(W9)

### Tests for User Story 3 (RED 먼저) ⚠️

- [x] T022 [P] [US3] 코드 언어 테스트 `tests/unit/plugins/code-lang.test.ts` — 언어 지정 시 ` ```lang `, 미지정 시 ` ``` `(기존 동작)

### Implementation for User Story 3

- [x] T023 [US3] 코드 블록 확장 `src/plugins/codeBlock.ts` — `dialog.fields=[{key:"language",label:"언어",optional:true}]`, `apply(s,inputs)`로 언어 펜스 (T022 통과). 프리뷰는 M1 파이프라인이 이미 언어 클래스 보존(무변경)

**Checkpoint**: 코드 언어 지정 동작

---

## Phase 6: User Story 4 - 표 행/열 추가 및 정렬 (Priority: P2)

**Goal**: 표 안에서 행/열 추가·열 정렬, 유효 GFM 문법 생성

**Independent Test**: 표 안 커서 → 행추가·열추가·가운데정렬이 정확한 GFM 생성(W10~W13)

### Tests for User Story 4 (RED 먼저) ⚠️

- [x] T024 [P] [US4] 표 연산 테스트 `tests/unit/markdown/table-ops.test.ts` — T1(isInTable)·T2(addRow)·T3(addColumn)·T4(setColumnAlign)·T5(표밖 no-op)·T6(셀수 불변식)

### Implementation for User Story 4

- [x] T025 [US4] 표 연산 순수함수 `src/lib/markdown/tableOps.ts` — `isInTable`·`addRow`·`addColumn`·`setColumnAlign`(셀수 정합성 보장) (T024 통과)
- [x] T026 [US4] 표 편집 액션 `src/plugins/tableEdit.ts` 또는 Toolbar 컨텍스트 — 행추가/열추가/정렬 버튼, `isInTable`일 때만 활성(표 밖 비활성)
- [x] T027 [US4] 툴바 표 컨텍스트 연결 `src/components/editor/Toolbar.tsx` — 표 액션 그룹 표시·활성 제어

**Checkpoint**: 표 편집 동작

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T028 단축키 전수 매핑 `src/components/editor/MarkdownEditor.tsx` — 토글 가능 신규 서식에 단축키(FR-011), IME 비충돌
- [x] T029 신규 UI anti-slop 자가 점검 — Dialog·활성표시·표 액션이 그라데이션·컬러그림자 없이 M1 토큰 재사용(헌법 V)
- [ ] T030 [P] `quickstart.md` W1–W15 검증 수행
- [x] T031 [P] `npm test` 전체(M1+M2) + `npm run build` 통과 확인
- [x] T032 [P] `TDD-IMPLEMENTS.md` 갱신 — M2 마일스톤·테스트 파일·상태 추가

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup(P1)**: 즉시
- **Foundational(P2)**: Setup 후 — US1·US3 BLOCK(계약 진화 의존). US2·US4는 계약 진화에 약하게 의존(다이얼로그 없음)이나 안전하게 Foundational 후 시작
- **US1(P1)**: Foundational 후. 누락 태그 — referenceLink·코드언어가 다중필드 다이얼로그(T005) 의존
- **US2(P1)**: Foundational 후. 활성표시 — 신규 플러그인(US1)이 등록돼 있으면 그들도 활성표시 대상이나, US1 없이도 M1 플러그인으로 독립 검증 가능
- **US3(P2)**: Foundational 후(다이얼로그). 독립
- **US4(P2)**: Foundational 후. tableOps는 독립(다이얼로그 무관) — 사실상 Setup 후 바로 가능

### Within Each User Story

- 테스트(RED) → 구현(GREEN) → 정리(REFACTOR)
- 순수함수(헬퍼·플러그인·tableOps·computeActiveIds) → 컴포넌트 통합

### Parallel Opportunities

- Foundational: T002·T004 [P]
- US1: T007·T008·T009 [P](테스트) → T011·T012·T013·T014 [P](플러그인 파일 분리)
- US2: T017 [P]
- US3: T022 [P]
- US4: T024 [P]
- Polish: T030·T031·T032 [P]
- 파일 공유 주의: `Toolbar.tsx`(US2 T021 + US4 T027), `MarkdownEditor.tsx`(Foundational T006 + US2 T020 + Polish T028) → 순차

---

## Parallel Example: User Story 1 (신규 태그 격리)

```bash
# 누락 태그 플러그인 = 파일 1개씩 동시 작성:
Task: "굵은 기울임 src/plugins/boldItalic.ts"
Task: "자동 링크 src/plugins/autolink.ts"
Task: "강제 줄바꿈 src/plugins/hardBreak.ts"
Task: "Setext 제목 src/plugins/setextHeading.ts"
# 참조 링크(T015)는 헬퍼(T010) 의존이라 순차. 마지막에 index.ts 1줄씩 등록
```

---

## Implementation Strategy

### MVP = US1 + US2 (P1 두 스토리)

1. Phase 1 Setup → Phase 2 Foundational(계약 진화, CRITICAL)
2. Phase 3 US1 → 누락 태그 완성 → 독립 검증(W1·W2·W4·W5·W6)
3. Phase 4 US2 → 활성표시 → 독립 검증(W7·W8) → **MVP: 명세 전 태그 + 토글 UX 완성**
4. Phase 5 US3(P2) 코드 언어 → Phase 6 US4(P2) 표 편집
5. Phase 7 Polish — 단축키·anti-slop·검증

### TDD 루프

- 각 스토리 RED → `/tdd-green` → `/tdd-refactor`. 순수함수(플러그인·tableOps·computeActiveIds) 우선

---

## Notes

- [P] = 다른 파일·의존 없음. `Toolbar.tsx`·`MarkdownEditor.tsx` 공유 작업은 [P] 제외
- 신규 태그 = 파일1 + index.ts 1줄, 파서·CM 어댑터 무수정(헌법 I·FR-012). 활성표시·표/언어 UI의 코어 수정은 FR-012 승인 범위(태그 격리 위반 아님)
- 렌더 파이프라인·sanitize 무변경(헌법 II). 기대값은 `docs/markdown-editor-spec.md`
- 각 작업·논리 그룹 후 커밋. 체크포인트에서 스토리 독립 검증
