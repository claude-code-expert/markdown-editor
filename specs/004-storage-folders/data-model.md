# Phase 1 Data Model: 저장소 — 폴더/문서 (M3)

영속 모델을 IndexedDB로 전환. requirement.md §5–6 스키마 기반.

## 엔티티 (IndexedDB DB `mdeditor`)

### Folder — 스토어 `folders` (keyPath `id`)

| 필드 | 타입 | 설명 | 규칙 |
|------|------|------|------|
| `id` | string (uuid) | PK | `crypto.randomUUID()` |
| `name` | string | 폴더 이름 | 비어 있지 않음 |
| `parentId` | string \| null | 상위 폴더(미래용) | M3는 항상 `null`(평면) |
| `createdAt` | number (epoch ms) | 생성 시각 | |

### Document — 스토어 `documents` (keyPath `id`, 인덱스 `by-folder`=`folderId`)

| 필드 | 타입 | 설명 | 규칙 |
|------|------|------|------|
| `id` | string (uuid) | PK | |
| `folderId` | string | 소속 폴더(FK→folders.id) | 인덱스 |
| `title` | string | 제목 | 기본 "제목 없음" |
| `content` | string | 마크다운 본문 | 빈 문자열 허용 |
| `createdAt` | number | 생성 시각 | |
| `updatedAt` | number | 마지막 저장 | 저장 시 갱신 |

**관계**: `folders (1) ──< documents (N)` via `documents.folderId`. 폴더 삭제 → 하위 문서 cascade(R7).

```text
folders (1) ──< documents (N)
   └─ parentId → folders (self, 미래 중첩용, M3 미사용)
```

## 런타임 상태

### useWorkspaceStore (신규)

| 필드 | 타입 | 설명 |
|------|------|------|
| `folders` | Folder[] | 전체 폴더 |
| `documents` | DocumentMeta[] | 문서 메타(목록용; content는 선택 로드) |
| `activeDocId` | string \| null | 현재 활성 문서 |
| `expanded` | Set<string> | 펼친 폴더 id(비영속) |
| `loadAll()` | async | 마이그레이션 후 폴더·문서 목록 로드 |
| `createFolder(name)` `renameFolder(id,name)` `deleteFolder(id)` | async | 폴더 CRUD |
| `createDocument(folderId)` `renameDocument(id,title)` `deleteDocument(id)` | async | 문서 CRUD |
| `selectDocument(id)` | async | content 로드 → 에디터 버퍼에 주입(savedDoc=doc) |
| `saveActive()` | async | 에디터 버퍼 doc → 활성 문서 content 기록 |
| `toggleExpand(folderId)` | sync | 트리 접기/펼치기 |

### useEditorStore (수정 — 활성 문서 버퍼)

| 필드 | 변경 |
|------|------|
| `doc` `savedDoc` `dirty` `activeIds` `inTable` | 유지(활성 문서 편집 버퍼) |
| `init`(단일 localStorage 로드) | 제거 → 워크스페이스 `selectDocument`가 버퍼 주입 |
| `save`(단일 localStorage 기록) | 제거 → 워크스페이스 `saveActive`로 위임 |
| `setBuffer(content)` | 신규: savedDoc=doc=content, dirty=false (문서 로드용) |

## 상태 전이

```text
앱 초기화
  → migrate(): documents 비면 "내 문서" 폴더 + (localStorage 있으면) 문서 1건
  → loadAll(): folders·documents 로드
  → selectDocument(첫 문서): content → 에디터 버퍼

문서 클릭
  → dirty면 확인(저장/버림/취소)  [FR-007]
  → selectDocument(id): activeDocId=id, content → setBuffer

저장
  → saveActive(): documents.updateContent(activeDocId, editor.doc), updatedAt=now
  → savedDoc=doc, dirty=false  [FR-006]

폴더/문서 생성·이름변경·삭제 → IndexedDB 반영 + 목록 갱신  [FR-001·002·010·011]
폴더 삭제 → 하위 문서 cascade, 활성 삭제 시 전환/빈 상태  [R7]
```

## 마이그레이션 노트

`mdeditor:v1`(M1 단일) → 첫 실행 1회 이관(R5). 이관 후 IndexedDB가 단일 출처. localStorage 키는 보존.
