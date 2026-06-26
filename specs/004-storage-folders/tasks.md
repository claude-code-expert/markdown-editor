---
description: "Task list — 저장소 폴더/문서 관리 (M3)"
---

# Tasks: 저장소 — 폴더/문서 관리 (M3)

**Input**: `specs/004-storage-folders/` 설계 문서
**Tests**: 포함(헌법 IV TDD). 리포지토리·이관·워크스페이스를 `fake-indexeddb`로 단위 테스트. 기존 91 회귀 0.
**Organization**: User Story별 페이즈. M2 사이드바 셸 위에 확장. 각 스토리 독립 테스트 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능(다른 파일·의존 없음)
- **[Story]**: US1~US5 (spec.md 매핑)

---

## Phase 1: Setup

- [x] T001 `idb` + `fake-indexeddb`(dev) 설치 + 기존 베이스라인 `npm test`(91) 재확인
- [x] T002 [P] `fake-indexeddb` Vitest 셋업 — `tests/setup/indexeddb.ts`(글로벌 주입) + `vitest.config.ts` `setupFiles` 등록

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: IndexedDB 저장소 인프라. **앱 비파괴**(전부 신규 파일, 기존 localStorage 에디터 유지). 모든 스토리 의존.

- [x] T003 [P] DB 스키마 `src/lib/storage/db.ts` — `openDB("mdeditor")`, 스토어 `folders`(key id)·`documents`(key id, 인덱스 `by-folder`), `Folder`/`Document`/`DocumentMeta` 타입(contracts/storage-db.md)
- [x] T004 [P] 리포지토리 테스트 `tests/unit/storage/folders.test.ts`·`documents.test.ts` — D1~D7(`fake-indexeddb`, RED 먼저)
- [x] T005 폴더 리포지토리 `src/lib/storage/folders.ts` — `listFolders·createFolder·renameFolder·deleteFolder`(D1·D4 cascade) (T004 통과)
- [x] T006 문서 리포지토리 `src/lib/storage/documents.ts` — `listByFolder·listAllMeta·getDocument·createDocument·updateContent·renameDocument·deleteDocument`(D2·D3·D5·D6)
- [x] T007 [P] 이관 테스트 `tests/unit/storage/migrate.test.ts` — M1~M4(localStorage mock + fake-indexeddb, RED)
- [x] T008 이관 `src/lib/storage/migrate.ts` — documents 비면 "내 문서" 폴더 + (localStorage `mdeditor:v1` 있으면) 문서 1건, 멱등 (T007 통과)
- [x] T009 [P] 워크스페이스 테스트 `tests/unit/store/workspace.test.ts` — W1~W6(selectDocument 버퍼 주입·saveActive·dirty 보호·A→B→A 무혼합, RED)
- [x] T010 워크스페이스 스토어 `src/lib/store/useWorkspaceStore.ts` — `folders·documents·activeDocId·expanded` + `loadAll·createFolder·createDocument·renameFolder·renameDocument·deleteFolder·deleteDocument·selectDocument·saveActive·toggleExpand` (T009 통과)

**Checkpoint**: 저장소·이관·워크스페이스 단위 테스트 GREEN. 앱은 아직 localStorage 에디터(미연결).

---

## Phase 3: User Story 3 - 폴더·문서 영속 + 이관 (Priority: P1) 🎯 spine

**Goal**: 앱을 IndexedDB에서 로드. 기존 단일 저장본을 기본 폴더로 이관. (데이터 로드 spine — US1·US2의 전제)

**Independent Test**: 폴더·문서 작성 후 새로고침 시 보존, 기존 `mdeditor:v1` 보유 사용자 첫 실행 시 "내 문서"에 그 내용(X5·X6).

- [x] T011 [US3] 에디터 버퍼 전환 `src/lib/store/useEditorStore.ts` — 단일 localStorage `init`/`save` 제거, `setBuffer(content)`(savedDoc=doc=content, dirty=false) 추가. doc·savedDoc·dirty·activeIds·inTable 유지
- [x] T012 [US3] 초기화 연결 `src/components/editor/EditorScreen.tsx` — 진입 시 `migrate()` → `loadAll()` → 첫 문서 `selectDocument`(기존 단일 `init` 대체)
- [x] T013 [US3] 저장 위임 `src/components/editor/StatusBar.tsx` — 저장 버튼 → `useWorkspaceStore.saveActive()`(활성 문서 기록), 취소 → 버퍼를 savedDoc으로
- [x] T014 [US3] 기존 회귀 갱신 `tests/unit/storage/local.test.ts` 등 — 단일 localStorage 의미를 이관 입력으로 조정(삭제 대신 migrate 경로로). 기존 의도 보존

**Checkpoint**: 앱이 IndexedDB에서 로드·저장, 이관 동작. 회귀 0.

---

## Phase 4: User Story 1 - 폴더/문서 생성·정리 (Priority: P1)

**Goal**: [+] 폴더 생성 + 폴더별 새 문서 + 폴더>문서 트리 표시

**Independent Test**: [+]로 폴더 생성, 폴더에 새 문서 → 트리에 폴더>문서 표시(X1·X2).

- [x] T015 [P] [US1] 트리 컴포넌트 `src/components/editor/FolderTree.tsx` — 워크스페이스 구독, 폴더>문서 1단계 렌더(S3), 빈 상태(S9), 한글 aria(S8)
- [x] T016 [US1] 사이드바 재작성 `src/components/editor/Sidebar.tsx` — `[+]` 폴더 생성 **활성**(인라인/다이얼로그) + `FolderTree` 배치 + 폴더별 "새 문서" 액션 → `createFolder`/`createDocument`(S1·S2)
- [x] T017 [P] [US1] 트리 렌더 테스트 `tests/unit/components/folder-tree.test.tsx` — 폴더/문서 노드·빈 상태·aria(S1~S3·S9)

**Checkpoint**: 폴더·문서 생성, 트리 표시.

---

## Phase 5: User Story 2 - 문서 선택·편집·저장 (다중) (Priority: P1)

**Goal**: 문서 클릭 → 로드, 활성 문서 저장, 전환 시 dirty 보호

**Independent Test**: A 저장→B 저장→A 재클릭 시 A 내용 정확 복원(X3·X4·X7).

- [x] T018 [US2] 문서 선택 `src/components/editor/FolderTree.tsx` — 문서 클릭 → `selectDocument(id)`(에디터 로드), 활성 문서 하이라이트(S5, ≤0.3초 SC-002)
- [x] T019 [US2] dirty 보호 `src/lib/store/useWorkspaceStore.ts`/`EditorScreen.tsx` — dirty 상태 전환 시 확인(저장/버림/취소) 후 전환(W3·FR-007)
- [x] T020 [US2] 활성 문서 삭제·빈 상태 처리 — 활성 삭제 시 다른 문서 전환 또는 빈 버퍼(W6 엣지)

**Checkpoint**: 다중 문서 전환·저장 무혼합.

---

## Phase 6: User Story 4 - 이름변경·삭제 (Priority: P2)

**Goal**: 폴더/문서 이름변경·삭제(폴더 cascade)

**Independent Test**: 폴더 이름변경 반영, 문서 삭제 후 영속 제거, 폴더 삭제 시 하위 cascade(X8·X9).

- [x] T021 [US4] 이름변경 액션 `src/components/editor/FolderTree.tsx` — 폴더/문서 인라인 이름변경 → `renameFolder`/`renameDocument`(S6)
- [x] T022 [US4] 삭제 액션 `src/components/editor/FolderTree.tsx` — 확인 후 `deleteFolder`(cascade 경고)/`deleteDocument`(S7·D4·D5)
- [x] T023 [P] [US4] rename/delete 테스트 `tests/unit/store/workspace-crud.test.ts` — 이름변경 반영·삭제 영속·cascade(워크스페이스 경유)

**Checkpoint**: 폴더/문서 이름변경·삭제.

---

## Phase 7: User Story 5 - 폴더 접기/펼치기 (Priority: P3)

**Goal**: 폴더 토글로 트리 정리

**Independent Test**: 폴더 접으면 하위 문서 숨고 펼치면 표시(X: S4).

- [x] T024 [US5] 폴더 토글 `src/components/editor/FolderTree.tsx` — 폴더 클릭 시 `toggleExpand(folderId)`, 접힘 시 하위 숨김(S4)

**Checkpoint**: 트리 접기/펼치기.

---

## Phase 8: Polish

- [x] T025 회귀 + 빌드 — `npm test`(기존 91 + M3) + `npm run build` 통과(SC-006)
- [x] T026 [P] 접근성 마감 — 트리 노드·생성·이름변경·삭제 키보드 순회 + 한글 aria(SC-007·S8)
- [ ] T027 [P] `quickstart.md` X1~X11 수동 검증(`npm run dev`)
- [x] T028 [P] `TDD-IMPLEMENTS.md`에 M3(저장소) 항목 추가

---

## Dependencies & Execution Order

- **Setup(P1)** → **Foundational(P2)**: 저장소 인프라(앱 비파괴) → 전 스토리 BLOCK
- **US3(P1, spine)**: Foundational 후 **먼저** — 앱을 IndexedDB로 갈아끼움(버퍼 전환·이관·초기로드). US1·US2의 전제
- **US1(P1)**: US3 후 — 트리 생성. `FolderTree`·`Sidebar`
- **US2(P1)**: US1 후 — 문서 선택·저장·dirty. `FolderTree`·workspace
- **US4(P2)**: US1 후 — rename/delete
- **US5(P3)**: US1 후 — toggle
- 파일 공유(순차): `FolderTree.tsx`(US1 T015 + US2 T018 + US4 T021/22 + US5 T024), `useWorkspaceStore.ts`(T010 + US2 T019), `EditorScreen.tsx`(US3 T012 + US2 T019)

### Parallel Opportunities

- Foundational 테스트: T004·T007·T009 [P]
- 리포지토리: folders(T005)·documents(T006) 다른 파일이나 db.ts 공유 → db 후 병렬 가능
- Polish: T026·T027·T028 [P]

---

## Implementation Strategy

### MVP = US3 + US1 + US2 (P1 셋)

1. Setup → Foundational(저장소 인프라, fake-indexeddb 테스트 GREEN)
2. US3 → IndexedDB 로드·이관·버퍼 전환 → 회귀 0 확인 (spine)
3. US1 → 폴더·문서 생성·트리
4. US2 → 다중 문서 전환·저장 → **MVP: 폴더/문서 영속 + 다중 편집**
5. US4(P2) rename/delete → US5(P3) toggle
6. Polish — 회귀·접근성·검증

### TDD 루프

- 리포지토리·이관·워크스페이스(순수+fake-indexeddb)부터 RED → GREEN → REFACTOR
- 헌법 IV: 비동기 저장 계층도 `fake-indexeddb`로 단위 검증

## Notes

- 플러그인·파이프라인·sanitize 무수정(헌법 I·II). 저장소·스토어·사이드바만 변경
- 최대 회귀 위험 = US3(T011~014) 에디터 버퍼 전환. 기존 91 통과 유지가 게이트(SC-006)
- 대시보드·파일리스트·저장시 폴더선택·라우팅 = M6(범위 밖)
- 각 작업·논리 그룹 후 커밋. 체크포인트에서 스토리 독립 검증
