# Contract: 워크스페이스 스토어 + 활성 문서 버퍼 협응

## 마이그레이션 (`src/lib/storage/migrate.ts`)

```typescript
migrate(): Promise<void>
```

| # | 규칙 | 검증 |
|---|------|------|
| M1 | documents 비어 있고 localStorage `mdeditor:v1` content 있음 → "내 문서" 폴더 + 문서 1건(그 내용) | SC-004 |
| M2 | documents 비어 있고 localStorage 없음 → "내 문서" 폴더만(문서 0 또는 빈 문서) | |
| M3 | documents 이미 존재 → 이관 건너뜀(멱등) | 재실행 안전 |
| M4 | localStorage 손상 → 빈 기본 문서로 안전 시작 | 엣지 |

## 워크스페이스 ↔ 에디터 버퍼 (`useWorkspaceStore` × `useEditorStore`)

| # | 규칙 | 검증 |
|---|------|------|
| W1 | `selectDocument(id)` → activeDocId=id, 문서 content를 에디터 `setBuffer`(savedDoc=doc, dirty=false) | SC-002 |
| W2 | `saveActive()` → `updateContent(activeDocId, editor.doc)`, editor savedDoc=doc, dirty=false | FR-006 |
| W3 | dirty 상태에서 `selectDocument(다른 id)` → 확인 콜백(저장/버림/취소) 후에만 전환 | FR-007 |
| W4 | 문서 A→B→A 전환 → 각 버퍼 내용 안 섞임 | SC-005 |
| W5 | `createFolder/createDocument/rename/delete` → IndexedDB 반영 + folders/documents 목록 갱신 | SC-001 |
| W6 | 활성 문서 삭제 → 다른 문서로 전환 또는 빈 버퍼 | R7 엣지 |

## 책임 경계

- 리포지토리(`storage/*`)는 IndexedDB I/O만. 협응·활성문서·dirty는 워크스페이스 스토어.
- 에디터 버퍼(`useEditorStore`)는 "현재 활성 문서"만 안다 — 폴더/문서 목록 미인지(단일 책임).
- 사이드바는 워크스페이스 스토어를 구독·호출(다음 계약).
