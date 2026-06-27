# Implementation Plan: 문서 흐름 — 대시보드·라우팅·폴더 저장 (M6)

**Branch**: `feature/init` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-dashboard-routing/spec.md`

## Summary

진입점을 단일 `/`(에디터) → **`/`(대시보드 파일 리스트)** + **`/editor/[docId]`(에디터)**로 분리한다.
대시보드는 M3 저장소의 문서를 리스트로 노출하고 클릭 시 동적 라우트로 이동한다. 에디터는 URL의
`docId`로 활성 문서를 선택한다(첫 문서 자동선택 제거). 상단에 **폴더 선택 컨트롤**을 두어 저장 대상
폴더를 지정하고 미선택 시 차단한다. 데이터·저장 모델은 M3를 그대로 재사용한다.

## Technical Context

**Language/Version**: TypeScript 5 (계승)
**Primary Dependencies**: 기존 + Next.js App Router 동적 라우트(`next/navigation`: `useRouter`·`useParams`·
`Link`). **신규 런타임 의존성 없음**. 저장소·렌더·플러그인 무변경.
**Storage**: 변경 없음 — M3 IndexedDB(folders/documents) 재사용.
**Testing**: Vitest — 중복 제목 접미사(`uniqueTitle`) 순수 함수 + 문서 이동(`moveDocument`)을
`fake-indexeddb`로 단위 테스트. 라우팅·대시보드 리스트는 런타임/시각. 기존 110 회귀 0.
**Target Platform**: 모던 브라우저, Vercel 정적, 클라이언트 라우팅.
**Project Type**: Web app — App Router 라우트 재배치 + 대시보드 페이지 + 폴더 셀렉터.
**Performance Goals**: 문서 로드 ≤0.5초(SC-002), 리스트 100% 표시(SC-001).
**Constraints**: 진입점 전환에도 기존 동작 회귀 0(SC-007), 없는 docId 안전 처리(SC-006), 한글 aria(FR-012), anti-slop.
**Scale/Scope**: 라우트 2개 + 대시보드 + 폴더 셀렉터. 새 데이터 없음.

## Constitution Check

| # | 원칙 | 게이트 | 판정 |
|---|------|--------|------|
| I | 플러그인 격리 | 툴바·플러그인·파이프라인 무수정 | ✅ 라우팅·대시보드·셀렉터만 |
| II | Sanitize | 렌더 경로 무변경 | ✅ |
| III | SDD | spec→plan | ✅ |
| IV | TDD (Vitest) | 순수 로직 테스트 | ✅ `uniqueTitle` 순수 + `moveDocument`(fake-indexeddb) |
| V | 무장식 디자인 | 대시보드·셀렉터 anti-slop | ✅ M1 토큰 재사용 |

**위반 없음.** Complexity Tracking 비움.

## Project Structure

```text
specs/006-dashboard-routing/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── routing.md         # 라우트·docId 선택·ensureLoaded 가드·네비게이션
│   ├── dashboard.md       # 파일 리스트 렌더·항목·빈 상태·클릭 이동
│   └── folder-select.md   # 상단 폴더 선택·이동·미선택 차단·중복명
└── checklists/requirements.md
```

### Source Code (수정/추가)

```text
src/app/
├── page.tsx                    # [재작성] Dashboard 렌더
└── editor/[docId]/page.tsx     # [신규] docId param → selectDocument → EditorScreen

src/components/dashboard/
└── Dashboard.tsx               # [신규] 문서 리스트(제목·폴더·수정시각) + 빈 상태 + 클릭 이동

src/components/editor/
├── EditorScreen.tsx            # [수정] 첫문서 자동선택 제거(URL 주도) + 상단 폴더 셀렉터 배치
├── FolderTree.tsx              # [수정] 문서 클릭 → router.push(/editor/[id])
└── FolderSelect.tsx            # [신규] 상단 폴더 선택 컨트롤(저장 대상)

src/lib/store/useWorkspaceStore.ts  # [수정] loadAll 멱등 가드(loaded), moveDocument(id,folderId)
src/lib/util/uniqueTitle.ts          # [신규] 순수: 동일 폴더 중복 제목 → 접미사

tests/unit/util/unique-title.test.ts
tests/unit/store/workspace-move.test.ts
```

**Structure Decision**: Next App Router 동적 라우트로 진입점을 분리한다 — `app/page.tsx`(대시보드),
`app/editor/[docId]/page.tsx`(에디터). 워크스페이스 스토어(zustand)는 클라이언트 네비게이션 간 유지되므로
`loadAll`을 멱등(loaded 가드)으로 만들어 두 페이지가 안전하게 호출한다. 에디터 진입은 URL `docId`로
`selectDocument`를 구동(첫 문서 자동선택 제거). 사이드바 문서 클릭도 `router.push`로 URL과 일치시킨다.
중복 제목 접미사는 순수 함수(`uniqueTitle`)로 분리해 Vitest 검증. 폴더 셀렉터는 활성 문서의 folderId를
지정·이동하고 선택 가능한 폴더가 없으면 저장을 차단한다.

## Complexity Tracking

> 위반 없음 — 비움.
