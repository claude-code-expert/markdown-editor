# Phase 1 Data Model: 단일 화면 마크다운 에디터 (M1)

M1은 **단일 문서**만 다룬다(spec FR-017). 폴더·다중 문서 모델(IndexedDB `folders`/`documents`)은
M3 범위이며 본 문서 끝에 이관 노트로만 남긴다.

## 엔티티

### Document (M1 — 단일, localStorage)

사용자가 작성하는 마크다운 텍스트 1건과 그 영속 상태.

| 필드 | 타입 | 설명 | 규칙 |
|------|------|------|------|
| `content` | string | 마크다운 본문 | 빈 문자열 허용 |
| `updatedAt` | number (epoch ms) | 마지막 저장 시각 | 저장 시 갱신 |

- **영속 위치**: `localStorage` 키 `mdeditor:v1`, 값 = `JSON.stringify({ content, updatedAt })`.
- **식별자 없음**: 단일 문서라 `id`/`title`/`folderId` 불필요(M3에서 도입).
- **시드(FR-018)**: 키 부재 시 `seed.ts` 온보딩 샘플을 초기 `content`로 사용. 키 존재(빈 값 포함)
  시 저장본 우선(FR-013). 시드는 최초 1회만.

### EditorState / EditorChange (런타임 — 플러그인 계약, 비영속)

플러그인 순수 함수의 입출력. 영속 모델 아님 — `contracts/markdown-plugin.md` 참조.

| 타입 | 필드 |
|------|------|
| `EditorState` | `doc: string`, `selectionStart: number`, `selectionEnd: number` |
| `EditorChange` | `doc: string`, `selectionStart: number`, `selectionEnd: number` |

## 런타임 상태 (Zustand `useEditorStore`)

| 필드 | 타입 | 파생/규칙 |
|------|------|----------|
| `doc` | string | 에디터 현재 내용 |
| `savedDoc` | string | 마지막 저장본(취소 복원 기준) |
| `dirty` | boolean | 파생: `doc !== savedDoc` |

상태 전이:

```text
init        → load(): localStorage 있으면 savedDoc=doc=저장본, 없으면 savedDoc=doc=seed
edit        → setDoc(next): doc=next  ⇒ dirty 재계산
save (FR-011) → savedDoc=doc + localStorage write(updatedAt=now) + 성공/실패 토스트
cancel (FR-014) → doc=savedDoc  ⇒ dirty=false
unload (FR-015) → dirty면 beforeunload 경고
```

## 파생 표시 데이터 (비영속)

| 값 | 출처 | 용도 |
|----|------|------|
| 문자수 | `doc.length` | 상태바(FR-016) |
| 줄수 | `doc.split("\n").length` | 상태바(FR-016) |
| 프리뷰 HTML | 파이프라인(`doc`) | Preview(FR-002~004) |

## M3 이관 노트 (참고 — 본 마일스톤 범위 밖)

폴더 도입 시 IndexedDB로 이관(헌법 §저장소, TRD §5):

```text
folders   (id uuid PK, name, parentId|null, createdAt)
documents (id uuid PK, folderId→folders.id, title, content, createdAt, updatedAt)
folders (1) ──< documents (N) ;  folders.parentId ──> folders (self, 중첩 트리)
```

M1 `mdeditor:v1` 단일 문서는 이관 시 루트 폴더의 documents 1건으로 승격.
