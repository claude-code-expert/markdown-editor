# Contract: 저장소 리포지토리 (IndexedDB / `idb`)

## DB 스키마 (`src/lib/storage/db.ts`)

```typescript
// DB "mdeditor", version 1
// folders:   keyPath "id"
// documents: keyPath "id", index "by-folder" → folderId
export interface Folder { id: string; name: string; parentId: string | null; createdAt: number; }
export interface Document { id: string; folderId: string; title: string; content: string; createdAt: number; updatedAt: number; }
export type DocumentMeta = Omit<Document, "content">;
```

## 리포지토리 함수 (비동기)

```typescript
// folders.ts
listFolders(): Promise<Folder[]>
createFolder(name: string): Promise<Folder>
renameFolder(id: string, name: string): Promise<void>
deleteFolder(id: string): Promise<void>   // 하위 documents cascade 삭제

// documents.ts
listByFolder(folderId: string): Promise<DocumentMeta[]>
listAllMeta(): Promise<DocumentMeta[]>
getDocument(id: string): Promise<Document | undefined>
createDocument(folderId: string, title?: string): Promise<Document>
updateContent(id: string, content: string): Promise<void>   // updatedAt 갱신
renameDocument(id: string, title: string): Promise<void>
deleteDocument(id: string): Promise<void>
```

## 계약 규칙 (테스트 가능 — `fake-indexeddb`)

| # | 규칙 | 검증 |
|---|------|------|
| D1 | createFolder → listFolders에 1건, id·createdAt 부여 | round-trip |
| D2 | createDocument(folderId) → listByFolder에 1건, 기본 title "제목 없음" | |
| D3 | updateContent → getDocument.content 일치, updatedAt 증가 | SC-003·005 |
| D4 | deleteFolder → 폴더 + 하위 documents 모두 삭제(cascade) | R7 |
| D5 | deleteDocument → 해당 문서만 삭제, 타 문서 영향 0 | |
| D6 | by-folder 인덱스로 폴더별 문서 조회 정확 | |
| D7 | 새로고침(재오픈) 후 데이터 보존 | SC-003 |

기대 스키마 출처: `docs/requirement.md §5–6`.
