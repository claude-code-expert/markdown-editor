# Phase 0 Research: 문서 흐름 (M6)

NEEDS CLARIFICATION 없음(진입점·폴더선택·중복명은 spec Clarifications에서 결정). 라우팅 재배치 방법 기록.

## R1. 진입점 분리 — App Router 동적 라우트

- **Decision**: `app/page.tsx`=대시보드, `app/editor/[docId]/page.tsx`=에디터. 에디터는 `useParams()`의
  `docId`로 `selectDocument(docId)` 구동. 네비게이션은 `useRouter().push`/`Link`.
- **Rationale**: requirement.md §2 구조. 문서마다 고유 URL → 새로고침·직접 진입 안정(FR-004·SC-003).
- **Alternatives considered**: 단일 페이지에서 쿼리스트링(`?doc=`)으로 전환 → 뒤로가기·공유 약함. 동적 라우트가 표준.

## R2. 스토어 로드 멱등 — ensureLoaded(loaded 가드)

- **Decision**: `loadAll` 시작에 `if (get().loaded) return;` 가드. 두 페이지(대시보드·에디터)가 진입 시
  안전하게 호출. 워크스페이스 zustand 스토어는 클라이언트 SPA 네비게이션 간 유지되므로 1회만 migrate/load.
- **Rationale**: 페이지 전환마다 재마이그레이션 방지. SC-007 회귀 0.
- **Alternatives considered**: 레이아웃에서 1회 로드 → 페이지별 데이터 준비 시점 불명확. 멱등 가드가 단순.

## R3. URL ↔ 활성 문서 동기화

- **Decision**: 에디터 페이지 effect: `ensureLoaded()` 후 `getDocument(docId)` 존재하면 `selectDocument`,
  없으면 대시보드(`/`)로 리다이렉트+안내(FR-005·SC-006). 사이드바(FolderTree) 문서 클릭 → `router.push(
  /editor/[id])`로 통일(클릭=네비게이션). 첫 문서 자동선택(M3)은 제거 — URL이 선택의 단일 출처.
- **Rationale**: URL을 활성 문서의 진실 출처로 → 새로고침·뒤로가기 일관(FR-004).
- **Alternatives considered**: 스토어 activeDocId가 URL과 양방향 동기 → 루프 위험. URL→스토어 단방향이 단순.

## R4. 저장 시 폴더 선택 — 셀렉터 + 차단 + 중복명

- **Decision**: 상단 `FolderSelect`가 폴더 목록 드롭다운 제공, 활성 문서의 folderId 표시·변경
  (`moveDocument(id, folderId)`). 선택 가능한 폴더가 없으면 저장 차단 + "폴더를 먼저 만드세요" 안내
  (FR-006·007). 저장 시 동일 폴더 중복 제목은 `uniqueTitle`로 접미사(`-1`) 부여(FR-009).
- **Rationale**: requirement.md FR-3. 미아 문서 방지. 중복 처리 순수 함수로 테스트 가능.
- **Alternatives considered**: 저장 시점 모달로 폴더 선택 → 흐름 끊김. 상단 상시 셀렉터가 매끄럽다.

## R5. 대시보드 리스트

- **Decision**: `Dashboard`가 `listAllMeta()`(M3) 기반 문서 메타를 폴더명과 함께 리스트로 렌더(제목·폴더·
  수정시각). 항목 클릭 → `/editor/[id]`. 문서 0이면 빈 상태 + 폴더/문서 만들 수단 안내(FR-001·002·003·
  US1 빈상태).
- **Rationale**: M3 데이터 재사용, 새 모델 0. SC-001 전 문서 표시.
- **Alternatives considered**: 폴더 그룹 트리형 대시보드 → 사이드바와 중복. 평면 리스트가 대시보드 목적에 적합.

## R6. 회귀 — 진입점 전환 영향

- **Decision**: dev 부팅/테스트가 `/`=에디터를 가정하던 부분 점검. EditorScreen은 라우트 안에서 동일
  렌더되므로 컴포넌트 테스트 영향 적음. 라우팅은 런타임 스모크로 확인.
- **Rationale**: SC-007 회귀 0. 기존 110 단위 테스트는 컴포넌트·순수 함수라 라우팅 무관(대부분 유지).

**Output**: 미해결 0. Phase 1 진행.
