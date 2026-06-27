---
description: "Task list — 마감 성능·접근성·안전종료·배포 검증 (M7)"
---

# Tasks: 마감 — 성능·접근성·안전종료·배포 검증 (M7)

**Input**: `specs/007-release-hardening/` 설계 문서(spec·plan·research·data-model·contracts·quickstart)
**Tests**: 포함(헌법 IV TDD). 대비·렌더예산·sanitize·대시보드 가드를 RED→GREEN. 기존 22파일 회귀 0.
**Organization**: User Story별 페이즈. 각 스토리 독립 검증.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 가능(다른 파일·의존 없음)
- **[Story]**: US1~US4 (spec.md 매핑)

**감사 grounding(2026-06-27)**: 인프라 대부분 존재(디바운스 120ms·sanitize 테스트·beforeunload·
키보드 리사이즈 rrp v4 기본·한글 aria). 실제 결함 4건만 수정: `--danger` 미정의·`--fg-faint`
대비 2.6:1·토스트 미구분·대시보드 링크 dirty 가드 없음.

---

## Phase 1: Setup

- [X] T001 베이스라인 재확인 — `npm test`(22파일 GREEN) + `npm run build`(무설정 성공) 실행해 회귀 기준선 고정. 신규 의존성 0.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 공유 디자인 토큰 정정(`globals.css`). US2 대비·US3 토스트가 함께 의존 → 스토리 진입 전 처리.

- [X] T002 [P] 대비 순수함수 테스트 `tests/unit/a11y/contrast.test.ts` — 상대휘도·대비비 순수 계산 + 텍스트 토큰쌍(`--fg`/`--fg-muted`/`--fg-faint` on `--bg`, `--accent-fg` on `--accent`)이 WCAG AA(4.5:1) 이상임을 단언. 현 `--fg-faint`(#98a1b2≈2.6:1)에서 RED.
- [X] T003 토큰 정정 `src/app/globals.css` — `--danger`(상태 의미색, 예 `#d64545`) 신규 정의 + `--fg-faint`를 대비 ≥4.5:1 값(예 `#6b7280`)으로 상향. T002 GREEN. (`FolderSelect.tsx:21`의 `var(--danger)` 깨짐도 동시 정상화.)

**Checkpoint**: 텍스트 대비 AA 충족, `--danger` 정의됨. 토스트·셀렉터 색 정상.

---

## Phase 3: User Story 1 - 빠른 편집(성능 마감) (Priority: P1) 🎯 spine

**Goal**: 1만자 문서 입력 무체감 + 프리뷰 디바운스 ≤150ms 1회 (NFR-2)

**Independent Test**: 1만자 연속 입력 시 끊김 없음, 입력 멎으면 디바운스 1회 갱신(contracts/performance.md P1·P3).

- [X] T004 [P] [US1] 렌더 예산·디바운스 테스트 `tests/unit/perf/render-budget.test.ts` — ① 1만자 마크다운 `renderMarkdown` 1회 실행이 환경 보정 예산 내(비선형 폭증 회귀 고정), ② 연속 변경 N회를 타이머 mock으로 발생 시 렌더 콜백 정확히 1회(P1). RED→GREEN.
- [X] T005 [US1] 디바운스 검증 `src/components/editor/Preview.tsx` — 현 120ms 트레일링이 ≤150ms(NFR-2) 충족 확인(코드 변경 없으면 그대로 유지, 주석으로 NFR-2 근거 명시).

**Checkpoint**: 디바운스 1회·렌더 예산 GREEN. 체감 즉시성(P2)·IME(P4)는 quickstart 수동(T016).

---

## Phase 4: User Story 2 - 키보드·보조기술 접근(접근성 마감) (Priority: P1)

**Goal**: 전 컨트롤 키보드 도달·한글 aria·키보드 리사이즈·WCAG AA 대비 (NFR-3)

**Independent Test**: 마우스 없이 전 동작 완수 + 대비 위반 0(contracts/accessibility.md A1~A4).

- [X] T006 [US2] aria 누락 점검·보정 `src/components/editor/StatusBar.tsx` — 저장/취소 버튼이 가시 텍스트로 접근명을 가짐을 확인(필요 시 명시 `aria-label` 추가). contracts/accessibility.md A1 표 전 행 도달 가능 확인.
- [X] T007 [US2] 키보드 리사이즈 검증 `src/components/editor/EditorScreen.tsx` — `Separator` 두 곳(112·143)이 `aria-valuenow`·tabIndex·화살표 키 동작·한계 정지(180–480px·25%)함을 확인. 증분 측정·문서화(화살표 ±5%p, Home/End 한계 — accessibility.md A3). 코드 변경 없음 — quickstart M3·M4로 수동 확정.

**Checkpoint**: 대비 AA(T002/T003)·키보드 도달·리사이즈 한계 확인.

---

## Phase 5: User Story 3 - 안전한 종료와 데이터 보호 (Priority: P1)

**Goal**: dirty 3경로 가드·sanitize 회귀·저장 토스트 구분·영속 (NFR-1·7)

**Independent Test**: 미저장 이탈 경고·XSS 미실행·성공/실패 토스트 구분(contracts/save-feedback.md S1~S4).

- [X] T008 [P] [US3] 이탈 가드 테스트 `tests/unit/util/dirty-guard.test.ts` — `mayDiscard(dirty, confirmFn)` 순수 판정: dirty 아니면 confirm 없이 통과, dirty+취소면 차단(CM jsdom 회피 위해 컴포넌트 대신 순수 헬퍼로 추출). RED→GREEN.
- [X] T009 [US3] 대시보드 dirty 가드 `src/components/editor/EditorScreen.tsx` — 헤더 `대시보드` `<Link>`(84)에 `onClick` 가드 추가: dirty면 `confirm` 후 통과/차단(`FolderTree` 패턴 재사용). T008 GREEN (FR-008·S1).
- [X] T010 [P] [US3] sanitize 회귀 확장 `tests/conformance/markdown/sanitize.test.ts` — 페이로드 셋 확장(`<iframe>`·`<svg onload>`·`<a href="data:...">`·`<style>`) 모두 무력화 단언(S2, 헌법 II). RED→GREEN(이미 차단되면 회귀 고정).
- [X] T011 [US3] 토스트 성공/실패 구분 `src/components/editor/StatusBar.tsx` — 성공=`border-left:3px var(--ok)`, 실패=`border-left:3px var(--danger)` + 의미색 아이콘/텍스트. 무채색 배경 유지, 컬러 그림자·글로우·그라데이션 금지(헌법 V). 실패는 `role="status"` 검토. FR-010·S3.

**Checkpoint**: 3경로 가드·XSS 0·토스트 시각 구분.

---

## Phase 6: User Story 4 - 무설정 배포 (Priority: P2)

**Goal**: Vercel 무설정 빌드 + 정적+클라이언트 동작 (NFR-6)

**Independent Test**: 클린 빌드 성공·서버 의존 0(spec US4).

- [X] T012 [US4] 빌드·정적 검증 — `npm run build`가 추가 설정 없이 성공하고 라우트 분리(`/` static·`/editor/[docId]` dynamic) 확인. 서버 전용 API(서버 액션·`route.ts` 등) 부재 확인 → 정적+클라이언트로 핵심 흐름 동작(FR-012·SC-008).

**Checkpoint**: 무설정 빌드 GREEN, 서버 의존 0.

---

## Phase 7: Polish

- [X] T013 전체 회귀 + 빌드 — `npm test`(기존 22 + M7 신규: 대비·렌더예산·대시보드가드·sanitize확장) + `npm run build` 통과(SC-009). 변경 표면(globals·StatusBar·EditorScreen) 회귀 점검.
- [X] T014 [P] `TDD-IMPLEMENTS.md`에 M7 항목 추가(결함 4건 수정·검증 테스트 2종·헌법 게이트).
- [X] T015 [P] M7 메모리 갱신 — `m3-pending.md` 마일스톤 표 `M7 마감 ✅(007)`로, 전 마일스톤 완료 기록.
- [ ] T016 [P] `quickstart.md` M1~M8 13항목 수동 검증(`npm run dev`) — 체감·IME·키보드·리사이즈·dirty 3경로·토스트 구분·영속·XSS 시각.

---

## Dependencies & Execution Order

- **Setup(P1)** → **Foundational(P2)**: 토큰 정정(globals.css)이 US2 대비·US3 토스트 색의 전제.
- **US1(P1, spine)**: Foundational 무관(성능은 토큰과 독립) — 병렬 착수 가능. 대표 검증.
- **US2(P1)**: Foundational(T003) 후 — 대비는 토큰 상향에 의존. 키보드는 검증만.
- **US3(P1)**: Foundational(T003 `--danger`) 후 토스트(T011). 가드(T009)·sanitize(T010)는 토큰 무관.
- **US4(P2)**: 전 스토리 후 최종 빌드 검증.
- 파일 공유(순차): `globals.css`(T003 단독), `StatusBar.tsx`(T006 US2 + T011 US3), `EditorScreen.tsx`(T007 US2 확인 + T009 US3 수정).

### Parallel Opportunities

- Foundational: T002 [P](테스트 먼저)
- US1: T004 [P]
- US3: T008·T010 [P](서로 다른 테스트 파일)
- Polish: T014·T015·T016 [P]

---

## Implementation Strategy

### MVP = US1 + US2 + US3 (P1 셋)

1. Setup(T001) → Foundational(T002 RED → T003 토큰 GREEN)
2. US1 성능(T004 렌더예산·디바운스 GREEN, T005 확인) — spine
3. US2 접근성(대비 자동 충족 + 키보드·aria 검증)
4. US3 안전종료(대시보드 가드·sanitize 확장·토스트 구분) — **MVP: 정량 성능 + AA 대비 + 안전 종료**
5. US4(P2) 무설정 빌드
6. Polish — 전체 회귀·문서·수동 검증

### TDD 루프

- 대비(T002)·렌더예산/디바운스(T004)·대시보드 가드(T008)·sanitize 확장(T010) = RED→GREEN.
- 키보드 리사이즈(T007)·체감/IME(T016)·빌드(T012)는 검증/수동.

## Notes

- 플러그인·파이프라인·저장 모델 무수정(헌법 I·II·III). sanitize는 **강화·회귀만**(제거·우회 0).
- 실패 토스트 구분은 무채색+의미색 1px 보더로만(헌법 V anti-slop). 컬러 그림자·그라데이션 금지.
- 신규 런타임 의존성 0. 회귀면 = globals.css·StatusBar·EditorScreen 3파일 + 신규 테스트 3.
- 측정 한계(프레임 체감·IME) 수동 명시(no silent cap) — quickstart 검증 매트릭스 참조.
- 각 작업 후 커밋. 체크포인트에서 스토리 독립 검증.
