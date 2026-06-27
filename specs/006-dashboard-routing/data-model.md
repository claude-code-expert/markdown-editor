# Phase 1 Data Model: 문서 흐름 (M6)

새 영속 엔티티 없음 — M3 `folders`/`documents`(IndexedDB) 재사용. 노출·런타임 확장만.

## 엔티티 (M3 재사용)

| 엔티티 | 비고 |
|--------|------|
| Folder | M3. 저장 대상 선택지 |
| Document | M3. 대시보드 리스트·`/editor/[id]` 주소로 노출. M6는 필드 무변경 |

## 런타임 상태 확장 (useWorkspaceStore)

| 항목 | 변경 |
|------|------|
| `loaded` | (기존) loadAll 멱등 가드로 활용(R2) |
| `loadAll` | [수정] 시작에 `if (loaded) return` 가드 |
| `moveDocument(id, folderId)` | [신규] 활성/대상 문서의 소속 폴더 변경(저장 대상 지정, R4) |
| `activeDocId` | (기존) URL `docId`가 단일 출처로 구동(R3) |

## 순수 함수

```typescript
// src/lib/util/uniqueTitle.ts — 동일 폴더 중복 제목 → 접미사 (FR-009)
export function uniqueTitle(existing: string[], title: string): string;
// 예: existing=["메모","메모-1"], title="메모" → "메모-2"
```

## URL ↔ 활성 문서 전이 (R3)

```text
대시보드(/) 진입
  → ensureLoaded()
  → documents 리스트 렌더
  → 항목 클릭 → router.push(/editor/[id])

에디터(/editor/[docId]) 진입
  → ensureLoaded()
  → getDocument(docId)
       있으면 → selectDocument(docId) → 버퍼 로드
       없으면 → / 리다이렉트 + 안내(FR-005)

사이드바 문서 클릭 → router.push(/editor/[id]) (URL과 일치)
```

## 저장 시 폴더 선택 (R4)

```text
상단 FolderSelect → 폴더 드롭다운(folders)
  선택 → moveDocument(activeDocId, folderId)
저장 시도
  선택 가능한 폴더 없음 → 차단 + 안내(FR-007)
  중복 제목 → uniqueTitle 접미사(FR-009)
  → saveActive (M3) → 성공/실패 토스트(FR-008)
```

데이터 이관·신규 스토어 없음.
