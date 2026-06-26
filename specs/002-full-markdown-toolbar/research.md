# Phase 0 Research: 전체 마크다운 툴바 (M2)

Technical Context 미해결(NEEDS CLARIFICATION) 없음 — 스택·렌더는 M1 확정분 계승. 본 문서는 M2
신규 기능을 M1 위에 얹을 때의 방법 결정을 기록한다.

## R1. 서식 활성 표시(isActive)의 반응성

- **Decision**: `MarkdownEditor`의 CM `updateListener`가 **selection 변경에도** 발화하도록 두고,
  변경 시 현재 `EditorState`로 모든 플러그인의 `isActive`를 평가해 활성 id 배열을 계산 →
  `useEditorStore.setActiveIds(ids)`. `Toolbar`는 `activeIds`를 구독해 버튼 활성 스타일 적용.
- **Rationale**: 단일 출처(store) + 코어 1곳(MarkdownEditor)에서 계산. Toolbar는 표시만. SC-002.
- **Alternatives considered**: Toolbar가 매 렌더마다 controller 폴링 → 선택 변경 이벤트 없으면
  갱신 누락. 기각. / 각 버튼이 개별 구독 → 중복 계산. 기각.
- **성능**: `isActive`는 커서 주변 문자열 검사(O(1)~O(줄길이))라 19개 평가도 즉시. 큰 문서 영향 미미.

## R2. 다이얼로그 다중 필드 — 계약 진화

- **Decision**: `MarkdownPlugin`을 `apply(state, inputs?: Record<string,string>)`로 진화하고,
  `dialog?: { fields: { key; label; placeholder? }[] }`를 선언적으로 추가. `Dialog.tsx`는
  `dialog.fields`를 렌더해 값 수집 후 `applyPlugin(plugin, values)` 호출.
- **Rationale**: 참조 링크(식별자+URL)·코드 언어(언어)·링크/이미지(URL)를 단일 메커니즘으로 통일.
  M1 link/image는 `inputs.url` 단일 필드로 이전(동작 동일).
- **Alternatives considered**: 참조 링크 전용 다이얼로그 별도 작성 → 다이얼로그 N개 난립. 기각.
  / 문자열 1개에 구분자 인코딩(`id|url`) → 취약·비테스트성. 기각.
- **마이그레이션**: 기존 `apply(state, input?: string)` 호출부(controller·CM keymap) 갱신. M1
  link/image 플러그인 시그니처 변경(단일 필드).

## R3. 참조 링크 — 전체 문서를 다루는 순수 함수

- **Decision**: `referenceLink.apply(state, {id, url})`가 (1) 본문 선택 위치에 `[텍스트][id]` 삽입,
  (2) 문서 하단에 `[id]: url` 정의를 append. **이미 같은 `id` 정의가 있으면 추가하지 않고 재사용**.
  정의 블록은 문서 끝에 모은다(빈 줄 1개로 본문과 분리).
- **Rationale**: spec FR-002·SC-003·엣지(중복 id 재사용). `apply`는 여전히 순수(전체 doc in→out).
- **Alternatives considered**: 정의를 커서 근처 삽입 → 본문 오염. 기각. / 정의 자동수집을 렌더
  단계에서 처리 → 원본 md에 안 남아 저장 시 소실. 기각.
- **검증**: `[id]: ` 라인 정규식으로 기존 정의 탐지. 단위 테스트로 중복 재사용 단언.

## R4. 표 편집 연산 — 순수 함수 분리

- **Decision**: `src/lib/markdown/tableOps.ts`에 `addRow`·`addColumn`·`setColumnAlign`을 순수
  함수로 구현. 입력 = (doc, cursorPos[, colIndex, align]) → 현재 커서가 속한 표 블록을 파싱
  (헤더·구분선·바디 행), 조작 후 재직렬화한 doc 반환. 표 밖이면 변경 없음(no-op) + 비활성.
- **Rationale**: 표 조작은 행/열 정합성(셀 수·구분선 너비) 보장이 핵심 → 순수 함수로 격리해
  Vitest 단위 테스트. 정렬은 구분선 셀을 `:---`/`:---:`/`---:`로 치환.
- **Alternatives considered**: AST(mdast) 왕복으로 표 조작 → M2 과설계, 원본 포맷 보존 어려움. 기각.
- **컨텍스트 감지**: 커서가 표 블록 내부인지 = 위/아래로 `|` 포함 연속 줄 + 구분선 존재 검사.
  Toolbar는 이 판정으로 표 액션 버튼 활성/비활성.

## R5. 코드 블록 언어 입력

- **Decision**: `codeBlock` 플러그인에 `dialog.fields=[{key:"language", optional}]` 추가.
  값 있으면 ` ```language `, 없으면 ` ``` `(M1 동작). 프리뷰는 M1 파이프라인이 이미
  `code[class=language-*]` 보존 → 추가 작업 없음. 자주 쓰는 언어는 placeholder/제안으로 보조.
- **Rationale**: 최소 변경으로 FR-008·SC-004 충족. 하이라이트 테마는 선택(범위 밖).
- **Alternatives considered**: `rehype-highlight` 도입 → 의존성·테마 추가, 본 마일스톤 불필요. 보류.

## R6. 신규 인라인/블록 플러그인 매핑

- **Decision**: `boldItalic`=`wrapSelection("***")`, `autolink`=`wrapSelection`류(`<`,`>` 비대칭
  → 전용 wrap), `hardBreak`=`insertAtLineEnd("\\")`(백슬래시 방식, 가시성·spec 권장),
  `setextHeading`=현재 줄 아래 `===`(h1)/`---`(h2) 삽입. 모두 기존 헬퍼 + 소수 신규 헬퍼로.
- **Rationale**: `markdown-editor-spec.md §4.3·§4.8·§4.9` 동작. 백슬래시 하드브레이크는 공백 2개
  대비 가시적(spec 권장).
- **Alternatives considered**: 하드브레이크를 공백 2개로 → 비가시·혼란. 기각.

**Output**: 미해결 0. Phase 1 설계 진행.
