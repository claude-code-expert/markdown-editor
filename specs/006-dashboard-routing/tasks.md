---
description: "Task list — 문서 흐름 대시보드·라우팅 (M6)"
---

# Tasks: 문서 흐름 — 대시보드·라우팅·폴더 저장 (M6)

**Input**: `specs/006-dashboard-routing/` 설계 문서
**Tests**: 포함(헌법 IV TDD). `uniqueTitle` 순수 + `moveDocument`(fake-indexeddb) 단위 테스트. 기존 110 회귀 0.
**Organization**: User Story별 페이즈. 각 스토리 독립 검증 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능(다른 파일·의존 없음)
- **[Story]**: US1~US4 (spec.md 매핑)

---

## Phase 1: Setup

- [x] T001 기존 베이스라인 `npm test`(110) 재확인(신규 의존성 없음 — Next App Router 사용)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 순수/저장소 로직 + 스토어 멱등화. **앱 비파괴**(신규 파일·내부 가드). 라우팅 스토리 전제.

- [x] T002 [P] 중복 제목 테스트 `tests/unit/util/unique-title.test.ts` — `uniqueTitle`(U1 원본·U2 `-1`·U3 `-2`) RED
- [x] T003 중복 제목 순수함수 `src/lib/util/uniqueTitle.ts` — `uniqueTitle(existing, title)` 접미사(T002 통과)
- [x] T004 [P] 문서 이동 테스트 `tests/unit/store/workspace-move.test.ts` — `moveDocument`(폴더 변경·영속, fake-indexeddb) RED
- [x] T005 워크스페이스 확장 `src/lib/store/useWorkspaceStore.ts` — `loadAll` 멱등 가드(`if (loaded) return`) + `moveDocument(id, folderId)`(문서 folderId 변경) (T004 통과)

**Checkpoint**: 순수·저장소 로직 GREEN. 앱은 아직 단일 라우트.

---

## Phase 3: User Story 2 - 문서별 주소(라우팅) (Priority: P1) 🎯 spine

**Goal**: `/editor/[docId]`로 문서 로드, URL이 활성 문서 단일 출처

**Independent Test**: 문서 주소 직접 진입·새로고침 시 그 문서 로드, 없는 주소 안전 처리(W4·W5·W6).

- [x] T006 [US2] 에디터 라우트 `src/app/editor/[docId]/page.tsx` — `useParams` docId → `loadAll`(멱등) → `getDocument` 있으면 `selectDocument`, 없으면 `/` 리다이렉트+안내(R2·R4·FR-004·005)
- [x] T007 [US2] EditorScreen URL 주도 `src/components/editor/EditorScreen.tsx` — M3 첫문서 자동선택 제거(선택은 라우트가 구동), 미저장 이탈 경고 유지(R3·R7·FR-010)
- [x] T008 [US2] 사이드바 네비게이션 `src/components/editor/FolderTree.tsx` — 문서 클릭 → `useRouter().push(/editor/[id])`(URL 일치, R6)

**Checkpoint**: 문서별 URL·새로고침 유지·없는 주소 안전.

---

## Phase 4: User Story 1 - 대시보드 파일 리스트 (Priority: P1)

**Goal**: `/` 대시보드에서 전 문서 리스트 + 클릭 이동

**Independent Test**: 대시보드 진입 → 전 문서 표시 → 클릭 → 에디터 로드(W1·W2·W3).

- [x] T009 [US1] 대시보드 컴포넌트 `src/components/dashboard/Dashboard.tsx` — `listAllMeta` + 폴더명 매핑 리스트(제목·폴더·수정시각), 빈 상태 안내, 항목 클릭 → `/editor/[id]`, 한글 aria(D1~D6)
- [x] T010 [US1] 루트 라우트 `src/app/page.tsx` 재작성 → `Dashboard` 렌더(`loadAll` 멱등)(R1·FR-001)

**Checkpoint**: 대시보드 리스트·네비게이션.

---

## Phase 5: User Story 3 - 저장 시 폴더 선택 (Priority: P1)

**Goal**: 상단 폴더 선택 + 미선택 차단 + 지정 폴더 저장

**Independent Test**: 폴더 선택 후 저장 → 해당 폴더, 미선택 → 차단(W7·W8).

- [x] T011 [US3] 폴더 셀렉터 `src/components/editor/FolderSelect.tsx` — 폴더 드롭다운(전 폴더) + 활성 문서 folderId 표시·변경(`moveDocument`) + 선택 가능 폴더 없음 시 저장 차단 안내, 한글 aria(F1~F3·F6)
- [x] T012 [US3] 상단바 배치 + 저장 통합 `src/components/editor/EditorScreen.tsx`/`StatusBar.tsx` — `FolderSelect`를 헤더에 배치, 저장 시 폴더 지정 보장(F4)

**Checkpoint**: 폴더 선택 저장·미선택 차단.

---

## Phase 6: User Story 4 - 중복 파일명 처리 (Priority: P3)

**Goal**: 동일 폴더 중복 제목 → 접미사 구분

**Independent Test**: 같은 폴더 같은 제목 저장 → `-1` 구분(W9).

- [x] T013 [US4] 중복명 통합 `src/lib/store/useWorkspaceStore.ts` — 문서 생성/이름변경 시 동일 폴더 제목에 `uniqueTitle` 적용(F5·FR-009)

**Checkpoint**: 중복 제목 자동 구분.

---

## Phase 7: Polish

- [x] T014 회귀 + 빌드 — `npm test`(기존 110 + M6) + `npm run build` 통과(SC-007). 진입점 전환 회귀 점검
- [ ] T015 [P] `quickstart.md` W1~W13 수동 검증(`npm run dev`) — 대시보드·라우팅·새로고침·폴더선택·중복명·접근성
- [x] T016 [P] `TDD-IMPLEMENTS.md`에 M6 항목 추가

---

## Dependencies & Execution Order

- **Setup(P1)** → **Foundational(P2)**: 순수·저장소 로직(앱 비파괴) → 라우팅 BLOCK
- **US2(P1, spine)**: Foundational 후 **먼저** — 에디터를 `/editor/[docId]`로 이동. US1 네비 대상
- **US1(P1)**: US2 후 — 대시보드가 `/editor/[id]`로 네비
- **US3(P1)**: US2 후 — 에디터 상단 셀렉터(EditorScreen 공유)
- **US4(P3)**: Foundational(uniqueTitle) 후 — 생성/이름변경 경로 통합
- 파일 공유(순차): `EditorScreen.tsx`(US2 T007 + US3 T012), `useWorkspaceStore.ts`(Found T005 + US4 T013), `FolderTree.tsx`(US2 T008)

### Parallel Opportunities

- Foundational: T002·T004 [P]
- Polish: T015·T016 [P]

---

## Implementation Strategy

### MVP = US2 + US1 + US3 (P1 셋)

1. Setup → Foundational(uniqueTitle·moveDocument·loadAll 멱등, 테스트 GREEN)
2. US2 라우팅 → 문서별 URL·새로고침 유지 (spine)
3. US1 대시보드 → 리스트·네비
4. US3 폴더 선택 저장 → **MVP: 대시보드 + URL + 폴더 저장**
5. US4(P3) 중복명
6. Polish — 회귀(진입점 전환)·검증

### TDD 루프

- `uniqueTitle`(U1~U3)·`moveDocument`(fake-indexeddb) RED → GREEN. 라우팅·대시보드·셀렉터는 런타임/시각.

## Notes

- 플러그인·파이프라인·sanitize·저장모델 무수정(헌법 I·II, M3 재사용). 라우팅·대시보드·셀렉터만 추가
- 최대 회귀 위험 = 진입점 전환(`/`=에디터→대시보드). 기존 110 통과 유지가 게이트(SC-007)
- URL = 활성 문서 단일 출처(첫문서 자동선택 제거). FSA 내보내기·모바일 = 범위 밖
- 각 작업 후 커밋. 체크포인트에서 스토리 독립 검증
