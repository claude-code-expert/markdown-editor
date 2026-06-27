---
description: "Task list — 에디터/프리뷰 보강 (M4)"
---

# Tasks: 에디터/프리뷰 보강 (M4)

**Input**: `specs/005-editor-preview-polish/` 설계 문서
**Tests**: 포함(헌법 IV TDD). 스크롤 비율 동기화 순수 함수 단위 테스트. 기존 104 회귀 0.
**Organization**: User Story별 페이즈. 각 스토리 독립 검증 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능(다른 파일·의존 없음)
- **[Story]**: US1~US3 (spec.md 매핑)

---

## Phase 1: Setup

- [x] T001 `@codemirror/lang-markdown` 설치 + 기존 베이스라인 `npm test`(104) 재확인

---

## Phase 2: User Story 1 - 에디터:프리뷰 비율 리사이즈 (Priority: P1) 🎯

**Goal**: 에디터·프리뷰 경계 드래그로 비율 조절

**Independent Test**: 경계 드래그 → 비율 변경·최소 한계 멈춤·입력 정상(Z1·Z2).

- [x] T002 [US1] 중첩 리사이즈 `src/components/editor/EditorScreen.tsx` — 컨텐츠 Panel 내부 고정 `flex` div를 중첩 가로 `Group`으로 교체: `Panel`(에디터, defaultSize "50%", minSize "25%") + `Separator`(md-resize-handle, aria-label="에디터·프리뷰 크기 조절") + `Panel`(프리뷰, preserve-relative-size, minSize "25%"). PanelLabel·MarkdownEditor·Preview 배치 유지 (L1·L2·L4·L5·FR-001~003)

**Checkpoint**: 에디터:프리뷰 비율 조절 동작.

---

## Phase 3: User Story 2 - 스크롤 동기화 (Priority: P1)

**Goal**: 한쪽 스크롤 → 상대 비례 이동(양방향), 되튐 없음

**Independent Test**: 긴 문서 에디터 50% 스크롤 → 프리뷰 ≈50%, 역방향도 동작, 되튐 0(Z3·Z4·Z5).

### Tests (RED 먼저) ⚠️

- [x] T003 [P] [US2] 스크롤 동기화 순수함수 테스트 `tests/unit/scroll/sync-scroll.test.ts` — `scrollRatio`·`targetScrollTop`·`canScroll`(Y1~Y5, 경계·round-trip)

### Implementation

- [x] T004 [US2] 동기화 모듈 `src/lib/scroll/syncScroll.ts` — 순수: `scrollRatio`·`targetScrollTop`·`canScroll`; 배선: `syncScroll(a,b)` 양방향 + lock+rAF 피드백 가드 + 정리 함수(Y6~Y8) (T003 통과)
- [x] T005 [US2] 스크롤러 노출 `src/components/editor/MarkdownEditor.tsx` + `controller.ts` — `EditorController.getScroller()` = `view.scrollDOM`
- [x] T006 [US2] 프리뷰 ref `src/components/editor/Preview.tsx` — 스크롤 컨테이너를 `forwardRef`로 노출
- [x] T007 [US2] 배선 `src/components/editor/EditorScreen.tsx` — effect에서 `controller.getScroller()` ↔ previewRef를 `syncScroll`로 연결, cleanup에서 해제(FR-004~006)

**Checkpoint**: 양방향 스크롤 동기화, 되튐 0.

---

## Phase 4: User Story 3 - 에디터 마크다운 구문 강조 (Priority: P2)

**Goal**: 에디터 입력의 마크다운 문법 시각 강조

**Independent Test**: `# 제목`·`**굵게**`·`` `코드` `` 입력 시 평문과 구분 강조(Z7).

- [x] T008 [US3] 구문 강조 `src/components/editor/MarkdownEditor.tsx` — CM `extensions`에 `markdown()`(`@codemirror/lang-markdown`) 추가, basicSetup·keymap·updateListener·theme와 공존(H1~H4·FR-007·008)

**Checkpoint**: 에디터 구문 강조 동작.

---

## Phase 5: Polish

- [x] T009 회귀 + 빌드 — `npm test`(기존 104 + M4) + `npm run build` 통과(SC-006)
- [ ] T010 [P] `quickstart.md` Z1~Z10 수동 검증(`npm run dev`) — 리사이즈·동기화 되튐·구문강조·한글 성능·접근성
- [x] T011 [P] `TDD-IMPLEMENTS.md`에 M4 보강 항목 추가

---

## Dependencies & Execution Order

- **Setup(P1)** → US1·US2·US3
- **US1(P1)**: 독립(EditorScreen 레이아웃)
- **US2(P1)**: 순수함수(T003·T004) 먼저 → 컴포넌트 배선(T005~007). T007은 US1의 EditorScreen 변경 후 권장(같은 파일)
- **US3(P2)**: 독립(MarkdownEditor 1줄). 단 US2 T005와 같은 파일 → 순차
- 파일 공유(순차): `EditorScreen.tsx`(US1 T002 + US2 T007), `MarkdownEditor.tsx`(US2 T005 + US3 T008)

### Parallel Opportunities

- US2: T003 [P](테스트)
- Polish: T010·T011 [P]

---

## Implementation Strategy

### MVP = US1 + US2 (P1 둘)

1. Setup(lang-markdown 설치, 베이스라인)
2. US1 리사이즈 → 독립 검증(Z1·Z2)
3. US2 스크롤 동기화(순수함수 RED→GREEN → 배선) → 독립 검증(Z3~Z5) → **MVP**
4. US3(P2) 구문 강조
5. Polish — 회귀·검증

### TDD 루프

- `syncScroll` 순수함수(Y1~Y5) RED → GREEN → REFACTOR. 리사이즈·구문강조·배선은 런타임/시각 검증.

## Notes

- 플러그인·파이프라인·sanitize 무수정(헌법 I·II). 레이아웃·CM·스크롤만 변경(SC-006 회귀 0 게이트)
- 구문 강조는 에디터 표시 전용 — 프리뷰 HTML 무관(contract H3)
- 비율·스크롤 상태 영속·코드블록 언어 하이라이트·수식 = 범위 밖(선택)
- 각 작업 후 커밋. 체크포인트에서 스토리 독립 검증
