---
description: "Task list — 단일 화면 마크다운 에디터 (M1)"
---

# Tasks: 단일 화면 마크다운 에디터 (M1)

**Input**: Design documents from `specs/001-single-screen-editor/`

**Prerequisites**: plan.md, spec.md (필수) · research.md · data-model.md · contracts/ · quickstart.md

**Tests**: 포함함. 헌법 원칙 IV(테스트 우선, Vitest TDD)가 순수 로직 테스트를 강제 →
플러그인·파이프라인·스토리지에 RED 테스트 선작성. 기대값 출처는 `docs/markdown-editor-spec.md`.

**Organization**: User Story별 페이즈. 각 스토리는 독립 구현·테스트 가능.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능(다른 파일, 미완 작업 의존 없음)
- **[Story]**: US1~US4 (spec.md user story 매핑)
- 파일 경로는 `src/` 루트(`create-next-app --src-dir`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 프로젝트 스캐폴딩·도구 구성

- [x] T001 `npx create-next-app@latest . --ts --tailwind --app --src-dir`로 Next 16 프로젝트 스캐폴딩(루트)
- [x] T002 의존성 설치(M1 핵심): `codemirror @codemirror/state @codemirror/view @codemirror/commands unified remark-parse remark-gfm remark-rehype rehype-sanitize rehype-stringify lucide-react zustand` (정확 버전은 `npm show`로 고정). `react-resizable-panels`는 M1 미사용 → T044(선택)에서 설치(C2 보정)
- [x] T003 [P] Vitest 구성: `vitest @testing-library/react jsdom` 설치 + `vitest.config.ts`(jsdom 환경) + `package.json` scripts(`test`, `vitest run`)
- [x] T004 [P] 디자인 토큰·폰트 구성 `src/app/globals.css` + Tailwind 설정: 무채색 베이스 + 액센트 `#3b5bdb`, Pretendard(본문)/JetBrains Mono(에디터) — `.claude/rules/anti-ai-slop.md` 준수(그라데이션·글로우·장식모션 금지)
- [x] T005 [P] `jsconfig.json` 등 Next 확정 이전 잔재 제거(존재 시), `tsconfig.json` strict 확인

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 모든 스토리가 의존하는 코어 골격

**⚠️ CRITICAL**: 이 페이즈 완료 전 어떤 User Story도 시작 불가

- [x] T006 [P] 플러그인 타입 정의 `src/plugins/types.ts` — `EditorState`, `EditorChange`, `PluginGroup`, `MarkdownPlugin` (contracts/markdown-plugin.md)
- [x] T007 Zustand 스토어 골격 `src/lib/store/useEditorStore.ts` — `doc`, `setDoc(next)`, 파생 `dirty` 자리(savedDoc/save는 US3에서 확장) (data-model.md)
- [x] T008 화면 셸 `src/app/layout.tsx`(폰트 로드) + `src/app/page.tsx`(루트 `/` → `EditorScreen` 렌더)
- [x] T009 `src/components/editor/EditorScreen.tsx` 레이아웃 골격 — 상단 툴바 슬롯 + 에디터:프리뷰 50:50 + 하단 상태바 슬롯(디자인 레퍼런스 픽셀 매칭)

**Checkpoint**: 골격 준비 — User Story 구현 시작 가능

---

## Phase 3: User Story 1 - 실시간 프리뷰 (Priority: P1) 🎯 MVP

**Goal**: 에디터 입력을 CommonMark+GFM로 정확·안전하게 실시간(≤150ms) 렌더

**Independent Test**: 표·취소선·체크박스·제목·코드블록 + 원시 `<script>`를 입력해 정확 렌더 +
스크립트 무력화 확인(quickstart V1·V2·V3)

### Tests for User Story 1 (RED 먼저 — 실패 확인 후 구현) ⚠️

- [x] T010 [P] [US1] CommonMark 코어 conformance 테스트 `tests/conformance/markdown/core.test.ts` — `renderMarkdown` 기대 HTML(markdown-editor-spec.md §0 코어 19기능), P2
- [x] T011 [P] [US1] GFM 확장 conformance 테스트 `tests/conformance/markdown/gfm.test.ts` — 표·취소선·작업목록·자동링크 리터럴(§0 G1–G4), P3
- [x] T012 [P] [US1] sanitize 테스트 `tests/conformance/markdown/sanitize.test.ts` — `<script>`·`on*`·`javascript:` 제거, 체크박스·표정렬 비손상(P4·P5·SC-005)

### Implementation for User Story 1

- [x] T013 [US1] 렌더 파이프라인 `src/lib/markdown/pipeline.ts` — `renderMarkdown(md):string` = remark-parse→remark-gfm→remark-rehype→rehype-sanitize→rehype-stringify (T010·T011 통과)
- [x] T014 [US1] sanitize 스키마 보강 `src/lib/markdown/pipeline.ts` — GitHub 스키마 + `input[type=checkbox][checked][disabled]`·`th/td[align]`·`a[href]`·`code[class]` 허용(T012 통과, P5)
- [x] T015 [US1] CodeMirror 6 래퍼 `src/components/editor/MarkdownEditor.tsx` — CM6 마운트, 변경 → `setDoc`, 한글 IME 조합 안전
- [x] T016 [US1] 프리뷰 `src/components/editor/Preview.tsx` — `renderMarkdown(doc)` 결과를 정제된 HTML로 렌더
- [x] T017 [US1] 디바운스 연결 `src/components/editor/MarkdownEditor.tsx`/Preview — doc→render 트레일링 디바운스 **100–120ms**(150ms 예산 내 렌더 헤드룸 확보, spec A1 보정), IME `composition` 가드(R2·SC-001)

**Checkpoint**: 입력→프리뷰 실시간 렌더 + XSS 방어 독립 동작

---

## Phase 4: User Story 2 - 툴바 플러그인 서식 (Priority: P1)

**Goal**: 툴바 버튼(플러그인)으로 문법 암기 없이 서식 삽입·토글. 코어 무수정 격리 유지

**Independent Test**: 텍스트 선택 후 굵게 토글 `**x**`↔`x`, 링크 버튼→URL→`[t](u)`, 단축키 동작(V4·V5)

### Tests for User Story 2 (RED 먼저) ⚠️

- [x] T018 [P] [US2] 헬퍼 테스트 `tests/unit/plugins/helpers.test.ts` — `wrapSelection`·`toggleLinePrefix`·`insertBlock`(C2 빈선택 커서, C3 wrap 토글, C4 line-prefix 멀티라인)
- [x] T019 [P] [US2] 플러그인 단위 테스트 `tests/unit/plugins/*.test.ts` — 각 플러그인 `apply`/`isActive` fixture 단언(C1·C5·C6, 기대값 markdown-editor-spec.md §3)

### Implementation for User Story 2

- [x] T020 [US2] 헬퍼 `src/plugins/helpers.ts` — `wrapSelection`·`toggleLinePrefix`·`insertBlock`(순수 함수) (T018 통과)
- [x] T021 [P] [US2] 인라인 wrap 플러그인 `src/plugins/{bold,italic,strikethrough,inlineCode}.ts`
- [x] T022 [P] [US2] 줄 접두 플러그인 `src/plugins/{heading(H1–H6 팩토리),blockquote,bulletList,orderedList,taskList}.ts`
- [x] T023 [P] [US2] 블록 플러그인 `src/plugins/{codeBlock,hr,table}.ts`
- [x] T024 [P] [US2] 다이얼로그 플러그인 `src/plugins/{link,image}.ts` — `apply`가 URL 인자 수용(C5)
- [x] T025 [US2] 레지스트리 `src/plugins/index.ts` — `PLUGINS[]` 배열(표시 순서) (T019 통과)
- [x] T026 [US2] 툴바 `src/components/editor/Toolbar.tsx` — `PLUGINS` 순회 렌더, `label`→`aria-label`, 키보드 포커스. **플러그인 비인지 코어**(격리 불변식, 헌법 I)
- [x] T027 [US2] CM6 어댑터 `src/components/editor/MarkdownEditor.tsx` — `EditorView`↔`EditorState` 변환, `apply()`의 `EditorChange`를 CM6 트랜잭션 dispatch(R1)
- [x] T028 [US2] 링크·이미지 다이얼로그 `src/components/editor/LinkDialog.tsx` — URL 입력 → 플러그인 `apply(url)` 호출(FR-008)
- [x] T029 [US2] 단축키 `src/components/editor/MarkdownEditor.tsx` — 플러그인 `shortcut`을 CM6 keymap 매핑, IME 비충돌(FR-009)

**Checkpoint**: 툴바·단축키 서식 삽입·토글 독립 동작, 새 태그=파일1개+index 1줄 검증

---

## Phase 5: User Story 3 - 로컬 저장 (Priority: P1)

**Goal**: 저장 시 로컬 영속, 재방문 자동 로드, 취소 복원, 미저장 이탈 경고, 첫 방문 시드

**Independent Test**: 작성→저장→새로고침 시 복원, 저장 후 수정→취소 복원, storage 비우고 진입→시드(V6·V7·V9)

### Tests for User Story 3 (RED 먼저) ⚠️

- [x] T030 [P] [US3] 스토리지 테스트 `tests/unit/storage/local.test.ts` — `loadDoc`/`saveDoc`(S1 시드, S2 저장본우선, S3 손상복구, S4 round-trip, S5 quota실패, S6 SC-004)

### Implementation for User Story 3

- [x] T031 [P] [US3] 온보딩 시드 `src/lib/constants/seed.ts` — 간결 샘플 마크다운(제목+표·작업목록 등 GFM 시연, FR-018)
- [x] T032 [US3] 로컬 스토리지 `src/lib/storage/local.ts` — `loadDoc()`/`saveDoc()`, 키 `mdeditor:v1`, 시드 fallback·파싱실패 복구·쓰기실패 처리 (T030 통과)
- [x] T033 [US3] 스토어 확장 `src/lib/store/useEditorStore.ts` — `savedDoc`, `save()`(localStorage write), `cancel()`(doc←savedDoc), 파생 `dirty`
- [x] T034 [US3] 상태바 저장/취소 `src/components/editor/StatusBar.tsx` — [저장]/[취소] 버튼 + 성공·실패 토스트(FR-011·012·014)
- [x] T035 [US3] 초기 로드 + 이탈 경고 `src/app/page.tsx`/EditorScreen — 진입 시 `loadDoc`(시드 우선순위 FR-013>FR-018), `dirty` 시 `beforeunload` 경고(FR-015)

**Checkpoint**: 저장·복원·취소·이탈경고·시드 독립 동작

---

## Phase 6: User Story 4 - 작성 분량 확인 (Priority: P3)

**Goal**: 하단 상태바에 문자수·줄수 실시간 표시

**Independent Test**: 입력 증감 시 문자수·줄수 즉시 갱신(V10)

### Tests for User Story 4 (RED 먼저) ⚠️

- [x] T036 [P] [US4] 카운트 테스트 `tests/unit/status/count.test.ts` — 문자수(`doc.length`)·줄수(`split("\n").length`) 순수 계산 단언

### Implementation for User Story 4

- [x] T037 [US4] 상태바 카운트 `src/components/editor/StatusBar.tsx` — `doc` 구독해 문자수·줄수 표시·갱신(FR-016). US3에서 생성한 StatusBar에 카운트 영역 추가

**Checkpoint**: 문자수·줄수 실시간 표시

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 스토리 횡단 마감(NFR·디자인·배포)

- [x] T038 접근성 마감 — 툴바 전체 키보드 Tab 순회 + 한글 `aria-label` 확인(NFR-3·SC-007·V11)
- [ ] T039 성능 검증 — 1만 자 문서 입력 지연 무체감, 디바운스 동작(SC-002·V1)
- [x] T040 디자인 일치 — `docs/design/project/Markdown Editor.dc.html`와 시각 픽셀 매칭 + anti-ai-slop 자가 점검(SC-008·V12)
- [ ] T041 [P] `quickstart.md` V1–V12 전체 검증 수행
- [x] T042 [P] Vercel 빌드 검증 — `npm run build` 무설정 통과, 서버 의존 없음(NFR-6)
- [x] T043 [P] `TDD-IMPLEMENTS.md` 생성 — M1 마일스톤·테스트 파일·RED/GREEN 상태 기록(TRD §7)

---

## Phase 8: 잔여·선택 (Deferred / Optional — M1 비차단)

**Purpose**: analyze가 식별한 잔여 항목(C2·D1)을 명시적 작업으로 고정. **MVP(P1 삼총사) 차단 아님** —
spec Assumptions상 권장·선택이거나 문서 보강 성격. M1 출시 후 또는 여유 시 처리.

- [ ] T044 [P] (선택, 권장 A-6) 에디터/프리뷰 경계 리사이즈 — `react-resizable-panels` 설치 + `src/components/editor/EditorScreen.tsx`에 분할 핸들 적용(기본 50:50 유지, 드래그 리사이즈). FR-001 고정 비율과 공존, spec Assumptions "리사이즈=권장" 근거 (C2)
- [ ] T045 [P] (문서) `specs/001-single-screen-editor/contracts/markdown-plugin.md`에 헌법 원칙 I 예외 명문화 — "팩토리(`createHeadingPlugins`)는 1파일에서 다중 플러그인 인스턴스(H1–H6) 생성 허용, 각 인스턴스는 레지스트리에 개별 등록"(D1)
- [ ] T046 [P] (선택, A-7) 에디터↔프리뷰 스크롤 동기화 `src/components/editor/EditorScreen.tsx` — spec Assumptions "스크롤 동기화=선택" 근거. M1 미포함 가능

> **명시적 비채택(M1 범위 밖, 참고)**: 폴더·문서 트리·다중 문서·대시보드(FR-017) · IndexedDB 이관(M3) ·
> `.md` 디스크 내보내기(FSA API, 선택) · 모바일 탭 전환(NFR-4 선택). 후속 마일스톤 `docs/PRD.md §2`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup(P1)**: 의존 없음, 즉시 시작
- **Foundational(P2)**: Setup 완료 후 — 모든 스토리 BLOCK
- **User Stories(P3~6)**: Foundational 완료 후. 병렬 가능하나 일부 파일 공유 의존 존재(아래)
- **Polish(P7)**: 원하는 스토리 완료 후

### User Story Dependencies

- **US1(P1)**: Foundational 후 시작. 독립
- **US2(P1)**: Foundational 후 시작. 플러그인 순수함수(T018~025)는 US1과 완전 독립. CM6 어댑터(T027)·단축키(T029)는 `MarkdownEditor.tsx` 공유 → US1의 T015와 같은 파일(순차 권장)
- **US3(P1)**: Foundational 후 시작. 스토어(T033)·page 로드(T035)는 US1/Foundational 골격 위에 확장. `StatusBar.tsx`(T034) 생성
- **US4(P3)**: US3가 만든 `StatusBar.tsx`에 카운트 추가(T037) → US3 선행. 카운트 로직(T036)은 독립 테스트 가능

### Within Each User Story

- 테스트(RED) 먼저 작성·실패 확인 → 구현(GREEN) → 정리(REFACTOR)
- 헬퍼/모델 → 서비스 → 컴포넌트 → 통합
- 스토리 완료 후 다음 우선순위

### Parallel Opportunities

- Setup: T003·T004·T005 [P]
- Foundational: T006 [P]
- US1: T010·T011·T012 [P](테스트 3종 동시)
- US2: T018·T019 [P](테스트) → T021·T022·T023·T024 [P](플러그인 파일 분리 — 격리 구조의 핵심 이점)
- US3: T030 [P]·T031 [P]
- Polish: T041·T042·T043 [P]
- 잔여·선택(Phase 8): T044·T045·T046 [P] — 서로 독립, MVP 비차단. T044는 US1(EditorScreen) 완료 후
- 서로 다른 스토리는 다른 개발자가 병렬(파일 공유 의존 주의: MarkdownEditor.tsx=US1+US2, StatusBar.tsx=US3+US4)

---

## Parallel Example: User Story 2 (플러그인 격리의 이점)

```bash
# 플러그인 = 파일 1개라 전부 동시 작성 가능:
Task: "인라인 wrap 플러그인 src/plugins/{bold,italic,strikethrough,inlineCode}.ts"
Task: "줄 접두 플러그인 src/plugins/{heading,blockquote,bulletList,orderedList,taskList}.ts"
Task: "블록 플러그인 src/plugins/{codeBlock,hr,table}.ts"
Task: "다이얼로그 플러그인 src/plugins/{link,image}.ts"
# 마지막에 레지스트리(index.ts)에 한 번에 등록 → Toolbar는 무수정
```

---

## Implementation Strategy

### MVP = P1 삼총사 (US1 + US2 + US3)

> 템플릿 기본은 "US1만 MVP"지만 본 기능은 P1이 3개. 프리뷰(US1)만으론 입력·저장이 없어
> 도구로 미성립 → **US1+US2+US3 함께가 진짜 MVP**(spec §1 핵심 가치 3축).

1. Phase 1 Setup → Phase 2 Foundational(CRITICAL)
2. Phase 3 US1 → 독립 검증(V1·V2·V3)
3. Phase 4 US2 → 독립 검증(V4·V5)
4. Phase 5 US3 → 독립 검증(V6·V7·V9) → **MVP 데모/배포**
5. Phase 6 US4(P3) → 분량 표시 추가
6. Phase 7 Polish → 접근성·성능·디자인·Vercel

### TDD 루프

- 각 스토리 테스트 페이즈에서 `/tdd-red`(실패 테스트) → `/tdd-green`(최소 구현) → `/tdd-refactor`
- 순수 로직(플러그인·파이프라인·스토리지)부터 — CM6·React 없이 빠른 RED-GREEN

---

## Notes

- [P] = 다른 파일·의존 없음. 같은 파일(`MarkdownEditor.tsx`, `StatusBar.tsx`)은 [P] 제외
- conformance/플러그인 테스트 기대값은 `docs/markdown-editor-spec.md`에서 가져온다(발명 금지, 헌법 IV)
- `rehype-sanitize` 제거·우회 변경 병합 불가(헌법 II) — T012·T013 게이트
- 새 마크다운 태그 = 플러그인 파일 1개 + index.ts 1줄, 코어(Toolbar/MarkdownEditor) 무수정(헌법 I)
- 각 작업·논리 그룹 후 커밋. 체크포인트에서 스토리 독립 검증
