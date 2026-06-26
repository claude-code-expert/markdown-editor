---
description: "Task list — 레이아웃 사이드바+리사이즈 (M2)"
---

# Tasks: 레이아웃 — 사이드바 + 리사이즈 (M2)

**Input**: `specs/003-sidebar-layout/` 설계 문서
**Tests**: 포함(헌법 IV). Sidebar 렌더 + 기존 88 회귀 0.

## Phase 1: Setup

- [x] T001 `react-resizable-panels` 설치 확인(`package.json`) + M1/M5 베이스라인 `npm test`(88) 재확인

## Phase 2: User Story 1 - 사이드바 3분할 레이아웃 (P1) 🎯

### Tests
- [x] T002 [P] [US1] Sidebar 렌더 테스트 `tests/unit/components/sidebar.test.tsx` — `[+] 폴더 생성` 버튼·트리 빈 상태 안내·`aria-label` 단언

### Implementation
- [x] T003 [US1] 사이드바 컴포넌트 `src/components/editor/Sidebar.tsx` — 헤더([+] 폴더 생성, M2 비활성), 트리 영역 빈 상태("폴더/문서 관리는 다음 단계"), 한글 aria(FR-005·007)
- [x] T004 [US1] 레이아웃 재구성 `src/components/editor/EditorScreen.tsx` — 상단바·상태바 전체 폭 유지, 그 사이를 `PanelGroup`(가로)으로 [Sidebar | 컨텐츠(Toolbar·TableActions·에디터:프리뷰)] 분할(FR-001·002·006)
- [x] T005 [US1] 사이드바 스타일 `src/app/globals.css` — 사이드바 배경·보더, 빈 상태 타이포(M1 토큰, anti-slop)

## Phase 3: User Story 2 - 사이드바 리사이즈 (P1)

### Implementation
- [x] T006 [US2] 리사이즈 핸들 `src/components/editor/EditorScreen.tsx` — `PanelResizeHandle` + Panel `defaultSize≈18 minSize≈12 maxSize≈34`(% 근사, 260px/180–480 대응), 핸들 `aria-label`(FR-003·004·007)
- [x] T007 [US2] 핸들 스타일 `src/app/globals.css` — 1px 중성 보더 핸들, hover 시 액센트(기능적, anti-slop)

## Phase 4: Polish

- [x] T008 회귀 + 빌드 — `npm test`(기존 88 + Sidebar) + `npm run build` 통과(SC-003)
- [ ] T009 [P] 수동 검증 — `npm run dev`로 사이드바 표시·드래그 리사이즈·에디터 비차단(SC-001·002)
- [x] T010 [P] `TDD-IMPLEMENTS.md`에 M2(레이아웃) 항목 추가

## Dependencies

- T001 → T002~T007 → T008 → T009/T010
- US1(T002~005) 먼저, US2(T006~007)는 EditorScreen 공유라 순차
- `EditorScreen.tsx`: T004·T006 동일 파일 → 순차

## MVP

US1(사이드바 표시) + US2(리사이즈) = M2 전체. 둘 다 P1.

## Notes

- 폴더/문서 데이터·CRUD·다중문서·IndexedDB = M3(범위 밖). M2는 레이아웃 셸 + 리사이즈.
- 기존 툴바·플러그인·에디터 무수정(헌법 I). 사이드바는 레이아웃 코어.
