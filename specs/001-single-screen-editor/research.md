# Phase 0 Research: 단일 화면 마크다운 에디터 (M1)

Technical Context에 미해결(NEEDS CLARIFICATION) 항목 없음 — 스택은 헌법 §기술스택 + `docs/TRD.md §1`로
확정. 본 문서는 확정 스택을 M1에 적용할 때의 **방법 결정**을 기록한다(라이브러리 선택 재논의 아님).

## R1. CodeMirror 6 ↔ 순수 플러그인 어댑터

- **Decision**: 플러그인은 CM6 비종속 `EditorState{doc, selectionStart, selectionEnd}`만 받는다.
  `MarkdownEditor.tsx` 어댑터가 CM6 `EditorView.state`에서 doc/주 selection을 읽어 `EditorState`로
  변환하고, `apply()`가 돌려준 `EditorChange`를 CM6 트랜잭션(`view.dispatch`)으로 반영한다.
- **Rationale**: 헌법 원칙 I·IV. 순수 함수라야 Vitest로 CM6·React 없이 단위 테스트 가능.
- **Alternatives considered**: 플러그인이 CM6 `EditorView`를 직접 조작 → 테스트에 DOM/CM6 필요,
  격리 깨짐. 기각.

## R2. 실시간 렌더 디바운스 (≤150ms, IME 안전)

- **Decision**: 에디터 doc 변경 → 150ms 트레일링 디바운스 후 파이프라인 실행 → Preview 갱신.
  IME 조합 중(`compositionstart`~`compositionend`)에는 디바운스 타이머를 미발화/연기해 조합 방해 방지.
- **Rationale**: NFR-2/SC-001(≤150ms), 한글 IME 안정성(헌법·NFR-3 인접). CM6는 IME 조합을
  네이티브로 처리하므로 어댑터는 조합 종료 후 상태만 읽는다.
- **Alternatives considered**: 매 키 입력마다 동기 렌더 → 1만 자에서 지연(SC-002 위반). 기각.
  requestIdleCallback → 브라우저 편차로 상한 보장 어려움. 기각.

## R3. unified 파이프라인 구성 & sanitize 스키마

- **Decision**: `unified().use(remarkParse).use(remarkGfm).use(remarkRehype)
  .use(rehypeSanitize, schema).use(rehypeStringify)`. 스키마는 기본 GitHub 스키마를 기반으로
  GFM 산출(체크박스 `input[type=checkbox][disabled][checked]`, 표 정렬 속성)을 허용하도록 확장.
- **Rationale**: 헌법 원칙 II(생략 불가). 기본 sanitize는 `<input>`·정렬 속성을 떨어뜨려 GFM
  작업목록·표가 깨지므로 화이트리스트 보강 필요.
- **Alternatives considered**: `react-markdown` + remarkGfm + rehypeSanitize 조합도 동등(TRD §4).
  M1은 문자열 HTML + `dangerouslySetInnerHTML`로 단순화하되, sanitize 후이므로 안전.
- **검증**: 원시 `<script>`·`onerror` 입력이 출력에서 제거됨을 conformance 테스트로 단언(SC-005).

## R4. 토글(isActive) 판정 규칙

- **Decision**: 인라인 wrap(굵게·기울임·취소선·코드)은 선택 영역이 정확히 `marker…marker`로
  감싸였는지로 `isActive` 판정, 적용 시 제거. 줄 접두(제목·인용·목록)는 줄 머리 접두 존재로 판정.
  이중 적용(`****…****`) 방지.
- **Rationale**: `markdown-editor-spec.md §2` 토글 규칙. spec FR-007.
- **Alternatives considered**: AST 기반 활성 판정 → M1 과설계. 문자열 경계 검사로 충분.

## R5. localStorage 영속 모델 & 첫 방문 시드

- **Decision**: 키 `mdeditor:v1`에 `{ content, updatedAt }` JSON 저장. 로드 시 키 부재 →
  `seed.ts`의 온보딩 샘플을 content로 사용(FR-018). 키 존재(빈 문자열 포함) → 저장본 우선(FR-013).
  파싱 실패 → 시드로 안전 복구(엣지). 저장 실패(quota 등) → 실패 토스트, 에디터 내용 유지.
- **Rationale**: spec FR-011~015·FR-018, clarify 결정. 헌법 §저장소(M1=localStorage 예외 허용).
- **Alternatives considered**: M1부터 IndexedDB → 단일 문서엔 과함, 헌법이 M1 예외 명시. 기각.

## R6. 상태 관리 경계 (Zustand)

- **Decision**: `useEditorStore`에 `doc`(현재), `savedDoc`(마지막 저장본), 파생 `dirty = doc!==savedDoc`.
  취소=`doc←savedDoc`(FR-014), 저장=`savedDoc←doc` + localStorage write, dirty 시 `beforeunload` 경고(FR-015).
- **Rationale**: 저장/취소/이탈경고 3흐름이 동일 상태쌍에서 파생. 단일 출처.
- **Alternatives considered**: React useState만 → beforeunload·파생 dirty 분산. 전역 store가 단순.

## R7. 디자인 토큰 & 폰트

- **Decision**: Tailwind 4 토큰으로 무채색 베이스 + 액센트 1색 `#3b5bdb`. 본문 Pretendard,
  에디터·코드 JetBrains Mono. 시각은 `docs/design/project/Markdown Editor.dc.html`에서 직접 측정.
- **Rationale**: 헌법 원칙 V + `.claude/rules/anti-ai-slop.md`. 그라데이션·글로우·장식모션 금지.
- **Alternatives considered**: 프로토타입 내부 구조(textarea+정규식) 복제 → 금지(시각만 매칭).

**Output**: 미해결 항목 0. Phase 1 설계 진행 가능.
