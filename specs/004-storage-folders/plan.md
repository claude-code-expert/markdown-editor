# Implementation Plan: 저장소 — 폴더/문서 관리 (M3)

**Branch**: `feature/init` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-storage-folders/spec.md`

## Summary

영속 계층을 `localStorage` 단일 문서 → **IndexedDB(`idb`)의 `folders`/`documents` 스토어**로 이관한다.
워크스페이스 스토어(폴더·문서 목록·활성 문서)를 도입하고, 에디터를 단일 버퍼 → **활성 문서 버퍼**로
전환한다. 사이드바(M2 셸)를 실제 폴더>문서 트리로 채운다([+] 폴더, 새 문서, 클릭→로드, 토글,
이름변경/삭제). 첫 실행 시 기존 `mdeditor:v1` 단일 저장본을 "내 문서" 기본 폴더의 문서로 이관.

## Technical Context

**Language/Version**: TypeScript 5 (계승)
**Primary Dependencies**: 기존 + `idb` 8.0.3(신규, IndexedDB 래퍼). 테스트용 `fake-indexeddb`(dev).
렌더·파서·플러그인 무변경.
**Storage**: **IndexedDB** DB `mdeditor` — 스토어 `folders`(키 id) · `documents`(키 id,
인덱스 `by-folder`=folderId). 헌법 §저장소의 "폴더 도입 시 IndexedDB 이관"을 실행(M1 localStorage 예외 종료).
**Testing**: Vitest + `fake-indexeddb` — 리포지토리 CRUD·이관·워크스페이스 스토어 단위 테스트. 기존 91 회귀 0.
**Target Platform**: 모던 브라우저(IndexedDB), Vercel 정적, 클라이언트 런타임.
**Project Type**: Web app — 저장소 계층 + 스토어 + 사이드바 트리 추가, 에디터 버퍼 전환.
**Performance Goals**: 문서 전환 ≤0.3초(SC-002). 트리 렌더 즉시.
**Constraints**: 다중 문서 전환 시 dirty 보호(FR-007), 회귀 0(SC-006), 한글 aria(FR-013), anti-slop.
**Scale/Scope**: 폴더 1단계 + 문서 N. 대시보드·라우팅·저장시 폴더선택 = M6(제외).

## Constitution Check

| # | 원칙 | 게이트 | 판정 |
|---|------|--------|------|
| I | 플러그인 격리 | 툴바·플러그인·파이프라인 무수정 | ✅ 저장소·스토어·사이드바만 변경, 플러그인 무관 |
| II | Sanitize | 렌더 경로 무변경 | ✅ |
| III | SDD | spec→plan | ✅ |
| IV | TDD (Vitest) | 순수 로직 테스트 | ✅ 리포지토리/이관/스토어를 `fake-indexeddb`로 단위 테스트 |
| V | 무장식 디자인 | 사이드바 트리 anti-slop | ✅ M1 토큰 재사용 |

**위반 없음.** 헌법 §저장소가 "폴더 도입 시 IndexedDB 이관"을 명시하므로 IndexedDB 채택은 계약 이행
(M1 localStorage 예외의 정상 종료). Complexity Tracking 비움.

## Project Structure

### Documentation (this feature)

```text
specs/004-storage-folders/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── storage-db.md       # folders/documents 리포지토리 CRUD + 스키마
│   ├── workspace-model.md  # 워크스페이스 스토어 + 활성문서 버퍼 협응
│   └── sidebar-tree.md     # 트리 렌더·상호작용 계약
└── checklists/requirements.md
```

### Source Code (기존 트리에 추가/수정)

```text
src/lib/storage/
├── db.ts            # [신규] idb openDB(mdeditor), 스토어/인덱스 정의
├── folders.ts       # [신규] listFolders·createFolder·renameFolder·deleteFolder
├── documents.ts     # [신규] listByFolder·getDocument·createDocument·updateContent·rename·delete
├── migrate.ts       # [신규] localStorage mdeditor:v1 → 기본 폴더 문서 이관(1회)
└── local.ts         # [유지] 이관 입력으로만 사용

src/lib/store/
├── useWorkspaceStore.ts  # [신규] folders·documents·activeDocId·expanded + 비동기 액션
└── useEditorStore.ts     # [수정] localStorage 직접 로드/저장 제거 → 활성문서 버퍼(doc·savedDoc·dirty 유지)

src/components/editor/
├── Sidebar.tsx      # [재작성] [+]폴더·새문서·트리·rename/delete 연결
├── FolderTree.tsx   # [신규] 폴더>문서 트리(토글·선택·컨텍스트 액션)
├── EditorScreen.tsx # [수정] 초기 로드=워크스페이스, 활성문서 전환 시 dirty 경고
└── StatusBar.tsx    # [수정] 저장 → 활성 문서에 기록

tests/unit/storage/   # folders·documents·migrate (fake-indexeddb)
tests/unit/store/     # workspace (활성문서 전환·저장)
```

**Structure Decision**: 저장소를 `src/lib/storage/`에 리포지토리 모듈로 분리(idb 비동기 함수). 워크스페이스
스토어가 폴더/문서 목록·활성 문서를 들고, 에디터 버퍼(`useEditorStore`)와 협응한다(선택 시 활성 문서
content를 버퍼에 로드, 저장 시 버퍼를 활성 문서에 기록). 사이드바 트리는 `FolderTree`로 분리(M2 `Sidebar`
셸을 채움). IndexedDB 비동기는 `fake-indexeddb`로 Vitest 단위 테스트.

## Complexity Tracking

> 위반 없음 — 비움.
