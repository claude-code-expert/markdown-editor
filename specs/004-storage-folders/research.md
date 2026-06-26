# Phase 0 Research: 저장소 — 폴더/문서 (M3)

NEEDS CLARIFICATION 없음(스택 확정, 모호점은 spec Clarifications에서 결정). 본 문서는 M1 localStorage
단일 문서를 IndexedDB 다중 문서로 전환하는 방법을 기록한다.

## R1. 저장 엔진 — IndexedDB(`idb`)

- **Decision**: `idb` 8.0.3로 DB `mdeditor` 개방. 스토어 `folders`(keyPath `id`)·`documents`(keyPath
  `id`, 인덱스 `by-folder`=`folderId`). 리포지토리 모듈(`folders.ts`/`documents.ts`)이 비동기 CRUD 노출.
- **Rationale**: 헌법 §저장소·TRD §5가 "폴더 도입 시 IndexedDB(`idb`) 이관"을 명시. 다중 문서·인덱스
  조회에 localStorage보다 적합. SC-003 영속.
- **Alternatives considered**: localStorage에 JSON 트리 → 문서 수 증가 시 직렬화 비용·동시성 취약. 기각.

## R2. IndexedDB 단위 테스트 — `fake-indexeddb`

- **Decision**: 테스트에서 `fake-indexeddb/auto`로 `indexedDB` 글로벌 주입 → 리포지토리·이관·스토어를
  실제 IndexedDB API로 단위 테스트(헌법 IV).
- **Rationale**: idb 비동기 로직을 모킹 없이 검증. jsdom엔 IndexedDB 없음.
- **Alternatives considered**: 리포지토리를 인터페이스로 추상화 후 인메모리 더블 → 실제 idb 경로 미검증. 보완용.

## R3. 활성 문서 모델 — 에디터 버퍼 전환

- **Decision**: `useEditorStore`는 **활성 문서의 편집 버퍼**(doc·savedDoc·dirty·activeIds·inTable) 유지.
  단일 localStorage 로드/저장 로직 제거. `useWorkspaceStore`가 `activeDocId`를 들고, `selectDocument(id)`가
  문서 content를 버퍼에 로드(savedDoc=doc=content), `saveActive()`가 버퍼 doc을 `documents.updateContent`로 기록.
- **Rationale**: 다중 문서(FR-005·006). 에디터는 "현재 활성 문서"만 알면 됨 → 버퍼 1개 재사용.
- **Alternatives considered**: 문서별 버퍼 N개 보관 → 메모리·동기화 복잡. 활성 1개로 충분.

## R4. dirty 보호 — 문서 전환 시

- **Decision**: 활성 문서에 미저장 변경(dirty)인 채 다른 문서를 클릭하면 확인(저장/버림/취소). 확인 통과 시
  전환. `beforeunload`(M1)는 유지.
- **Rationale**: FR-007·SC-005(내용 안 섞임). 전환 중 유실 방지.
- **Alternatives considered**: 자동 저장 후 전환 → 의도치 않은 저장. 명시적 확인 채택.

## R5. localStorage → IndexedDB 이관(1회)

- **Decision**: 앱 초기화 시 `migrate()` — DB `documents`가 비어 있으면 (1) "내 문서" 기본 폴더 생성,
  (2) `mdeditor:v1`에 content 있으면 그 내용으로 문서 1건 생성(제목=첫 H1 또는 "제목 없음"), 없으면 폴더만.
  이관 후 localStorage 키는 보존(롤백 안전), 이후엔 IndexedDB가 단일 출처.
- **Rationale**: FR-009·SC-004 손실 0. 기존 사용자 데이터 보존.
- **Alternatives considered**: 이관 후 localStorage 삭제 → 롤백 불가. 보존이 안전.
- **검증**: `fake-indexeddb` + mock localStorage로 이관 후 문서 1건·내용 일치 단언.

## R6. 식별자·트리 상태

- **Decision**: id = `crypto.randomUUID()`(브라우저·노드 모두 제공). 폴더 접힘 상태(expanded)는 워크스페이스
  스토어의 `Set<folderId>`로 런타임 보관(영속은 선택, M3는 비영속 허용).
- **Rationale**: 안정적 고유키. 트리 토글은 UI 상태라 비영속 무방.
- **Alternatives considered**: 증가 정수 id → 동시성·충돌. uuid 채택.

## R7. 폴더 삭제 시 하위 문서

- **Decision**: 폴더 삭제는 확인 후 **하위 문서 함께 삭제**(cascade). 활성 문서가 삭제 대상이면 다른 문서로
  전환하거나 빈 상태.
- **Rationale**: FR-011·엣지. 고아 문서 방지.
- **Alternatives considered**: 문서를 기본 폴더로 이동 → M3 과설계. cascade가 단순·명확.

**Output**: 미해결 0. Phase 1 진행.
