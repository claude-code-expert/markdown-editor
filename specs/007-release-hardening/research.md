# Research: M7 마감 — 성능·접근성·안전종료·배포

Phase 0. spec의 NFR 마감을 위한 4개 결정. 코드 감사(2026-06-27) 결과로 grounding.

---

## R1 — 키보드 영역 리사이즈 (FR-006)

**Decision**: 신규 코드 없이 `react-resizable-panels` 4.11의 `Separator` 기본 키보드 지원에 의존.
M7은 **증분·한계 동작 검증**만 수행한다.

**Rationale**: 설치본(`node_modules/react-resizable-panels/dist`) 직접 검사에서 `Separator`가
`role="separator"`·`tabIndex`·`aria-valuenow`·`keydown`(`ArrowLeft`/`ArrowRight`) 핸들러를 기본
내장함을 확인. 현재 두 핸들 모두 한글 `aria-label`까지 부여돼 있음(`EditorScreen.tsx:112,145`).
화살표로 경계 이동, `minSize`/`maxSize`(사이드바 180–480px, 에디터/프리뷰 25% 하한)에서 멈춤.

**검증 방법**: quickstart 수동(Tab→핸들 포커스→화살표 이동→하한 정지) + `aria-valuenow` 존재 확인.

**Alternatives considered**: 커스텀 keydown 핸들러 작성 → 라이브러리 중복·회귀 위험으로 기각.
005 quality.md CHK002("암묵 위임 우려")는 라이브러리 기본이 충족됨이 확인돼 해소.

---

## R2 — 색 대비 WCAG AA (FR-007, SC-005)

**Decision**: 토큰 대비비를 자동 테스트로 고정. **`--fg-faint`를 `#98a1b2` → 대비 ≥4.5:1 값으로
상향**(권장 `#6b7280`≈4.8:1). `--danger` 신규 정의(상태 의미색). 나머지 본문 토큰은 통과 확인만.

**Rationale**: 흰 배경(`#ffffff`) 대비 측정 —
- `--fg #1c2434` ≈ **14:1** ✅ (본문)
- `--fg-muted #4a5568` ≈ **7.4:1** ✅ (보조)
- `--fg-faint #98a1b2` ≈ **2.6:1** ❌ (상태 텍스트·자/줄 카운트·패널 라벨 8곳) → AA 미달
- `--ok #2bb673` ≈ 2.3:1 — 단, **점 인디케이터(aria-hidden 장식)**로만 사용 → 텍스트 아님, 면제

11px bold 패널 라벨은 WCAG "large text"(≥18.66px bold) 기준 미달이라 4.5:1 적용 대상. 따라서
`--fg-faint` 상향이 필요.

**검증 방법**: `tests/unit/a11y/contrast.test.ts` — 순수 함수로 상대휘도·대비비 계산, 텍스트로
쓰이는 토큰쌍이 4.5:1 이상임을 단언(헌법 IV TDD). 색 계산은 프레임워크 비종속 순수 로직.

**Alternatives considered**: `--fg-faint`를 그대로 두고 폰트만 키움 → 디자인 픽셀 매칭 깨짐으로
기각. 토큰 미세 조정이 시각 영향 최소.

---

## R3 — 성능 검증 방법 (FR-001·002, SC-001·002)

**Decision**: 무거운 런타임 벤치 없이 **(a) 렌더 예산 단위 테스트 + (b) 디바운스 동작 단언 +
(c) quickstart 수동 체감 측정** 3단으로 검증.

**Rationale**: 현 `Preview.tsx:17` 디바운스 120ms는 NFR-2(≤150ms) 충족. 입력→문자 표시는
CodeMirror 6가 담당(프리뷰 재렌더와 분리)이라 "글자당 재렌더 0회"가 핵심. 자동 검증 가능 부분:
- 1만 자 입력 문자열에 대한 `renderMarkdown` 1회 호출 시간이 예산(예 ≤50ms, jsdom 환경 보정) 내.
- 디바운스: 연속 변경 N회 → 렌더 콜백 1회만 발생(타이머 mock).

체감 지연(프레임 단위)은 jsdom에서 정확 측정 불가 → quickstart 수동(1만자 붙여넣고 연속 타이핑,
끊김·프리뷰 밀림 관찰)으로 보완. **측정 한계를 quickstart에 명시**(no silent cap).

**Alternatives considered**: Playwright + 실브라우저 트레이싱 → 스택·CI 비용 큼, NFR-2 수준엔
과함. Assumptions의 "프레임워크 미도입"과 충돌 → 기각.

---

## R4 — 클라이언트 네비게이션 dirty 가드 (FR-008)

**Decision**: `EditorScreen`의 `대시보드` 링크(클라 네비)에 dirty 확인 가드를 추가. `FolderTree`가
이미 쓰는 `window.confirm` 패턴 재사용(문서 전환과 동일 UX).

**Rationale**: 현재 보호는 두 층 — `beforeunload`(새로고침·탭닫기, `EditorScreen.tsx:42`)와
`window.confirm`(문서 전환, `FolderTree.tsx:38`). 그러나 `대시보드` `<Link>`는 SPA 클라 네비라
`beforeunload`가 발화하지 않아 **dirty 상태로 클릭하면 경고 없이 이탈**. spec FR-008은 "대시보드
이동"을 명시 → 갭. `<Link>`를 `onClick`에서 dirty면 `confirm` 후 `router.push`로 전환(또는
`e.preventDefault()`).

**검증 방법**: 컴포넌트 테스트(dirty=true에서 대시보드 클릭 → confirm 호출) + quickstart 수동.

**Alternatives considered**: Next `useRouter` 전역 라우트 가드 → App Router에 안정 API 부재,
범위 과대. 링크 1곳 onClick 가드가 최소·국소.

---

## 종합 — 변경 표면

| 항목 | 코드 변경 | 검증 |
|------|-----------|------|
| R1 키보드 리사이즈 | 없음 | 수동 + aria-valuenow |
| R2 대비 | `globals.css`(--fg-faint↑, --danger 추가) | contrast.test.ts |
| R3 성능 | 없음(디바운스 유지) | render-budget.test.ts + 수동 |
| R4 클라 네비 가드 | `EditorScreen.tsx` 대시보드 링크 | 컴포넌트 테스트 + 수동 |
| 토스트 구분 | `StatusBar.tsx`(role=status, --danger 보더) | 수동 + 스냅 |

모든 NEEDS CLARIFICATION 해소. 신규 의존성 0. 헌법 위반 0.
