# Implementation Plan: 마감 — 성능·접근성·안전종료·배포 검증 (M7)

**Branch**: `feature/init` (스펙 디렉터리 `007-release-hardening`) | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-release-hardening/spec.md`

## Summary

M7은 신규 기능이 아니라 **NFR 마감 마일스톤**이다. 코드 감사 결과 인프라는 대부분 이미 존재한다
(프리뷰 디바운스 120ms·sanitize 테스트·저장 토스트·dirty beforeunload·키보드 리사이즈 라이브러리
기본·한글 aria 라벨). 따라서 본 작업은 **(1) 정량 검증 자동화 + (2) 발견된 소수 결함 수정 +
(3) 흩어진 수동 검증의 정식 시나리오화**로 구성된다. 새 데이터 모델·새 렌더 경로·무거운 E2E
프레임워크는 도입하지 않는다.

**감사로 확정된 실제 결함(수정 대상)**:
- `--danger` 토큰 미정의(`globals.css`)인데 `FolderSelect.tsx:21`이 `var(--danger)` 사용 → 색 깨짐.
- `--fg-faint: #98a1b2`의 흰 배경 대비 ≈ 2.6:1 → WCAG AA(4.5:1) 미달. 상태 텍스트(자/줄 카운트,
  패널 라벨, 트리 힌트 8곳)에 사용 → FR-007/SC-005 위반.
- 저장 성공/실패 토스트가 동일 배경(`#1c2434`)이라 시각 구분 없음 → FR-010 미충족.
- `대시보드` 링크는 클라이언트 네비라 `beforeunload`가 안 걸림 → dirty 상태에서 클릭 시 경고 없이
  이탈 가능 → FR-008 부분 갭.

**검증으로 닫는 항목(코드 변경 최소)**: 성능(디바운스·1만자), 키보드 리사이즈 증분·한계, sanitize
회귀, 영속, 무설정 빌드.

## Technical Context

**Language/Version**: TypeScript 5.7 · React 19.2 · Next.js 16.2 (App Router)

**Primary Dependencies**: 기존 스택 재사용 — CodeMirror 6, unified(remark/rehype + rehype-sanitize),
react-resizable-panels 4.11, Zustand 5, idb 8. **신규 런타임 의존성 0**.

**Storage**: IndexedDB(`idb`) — 기존 `folders`/`documents` 모델 재사용, 변경 없음.

**Testing**: Vitest 4 (jsdom) — 기존 22개 파일. M7은 성능·대비·접근성 회귀 테스트 추가.
무거운 브라우저 자동화(Playwright 등) **미도입**(Assumptions 확정).

**Target Platform**: 데스크톱 브라우저(정적+클라이언트, 서버 의존 0). Vercel 무설정 배포.

**Project Type**: 단일 웹앱(프런트엔드 전용, Next App Router).

**Performance Goals**: 입력→문자 표시 ≈ 1프레임(16ms), 프리뷰 디바운스 ≤150ms(현 120ms),
1만 자 문서 입력 무체감(NFR-2).

**Constraints**: 색 대비 WCAG AA(본문/상태 텍스트 4.5:1), 키보드 100% 도달, sanitize 항상,
회귀 0(기존 테스트 GREEN 유지).

**Scale/Scope**: 4개 User Story(성능·접근성·안전종료·배포), FR-001~013, SC-001~009.
영향 파일 소수(globals.css·StatusBar·FolderSelect·EditorScreen) + 신규 테스트.

## Constitution Check

*GATE: Phase 0 전 통과 필수. Phase 1 설계 후 재점검.*

| 원칙 | 적용 | 판정 |
|------|------|------|
| I 플러그인 격리 | M7은 `src/plugins/*` 무수정. 코어·툴바 변경 없음(StatusBar/globals만) | ✅ 통과 |
| II Sanitize-Always (NON-NEG) | sanitize 파이프라인 **강화·회귀 검증만**. 제거·우회 0 | ✅ 통과 |
| III SDD (NON-NEG) | spec→plan→tasks 순서 준수. 본 plan이 그 산물 | ✅ 통과 |
| IV TDD (Vitest) | 대비·성능·접근성 회귀를 순수/단위 테스트로 RED→GREEN | ✅ 통과 |
| V 무장식 디자인 | 실패 토스트 구분은 **의미색(빨강) 1px 보더/텍스트**로만 — 컬러 그림자·글로우·그라데이션 금지. `--danger`는 상태 의미색 추가(장식 아님) | ✅ 통과 |

**위반 없음** → Complexity Tracking 불필요.

**설계 후 재점검(Phase 1 종료)**: 실패 토스트 시각 구분안이 anti-slop을 지키는지가 유일 리스크.
처방 = 배경 무채색 유지 + 좌측 `border-left: 3px solid var(--danger)` + 아이콘/텍스트 의미색.
컬러 그림자·배경 채도 금지. → 통과 유지.

## Project Structure

### Documentation (this feature)

```text
specs/007-release-hardening/
├── plan.md              # 이 파일
├── research.md          # Phase 0 — R1 키보드 리사이즈·R2 대비·R3 성능검증·R4 클라네비 가드
├── data-model.md        # Phase 1 — 신규 모델 없음(명시)
├── quickstart.md        # Phase 1 — 통합 수동·자동 검증 시나리오(M1~M6 수동 잔여 흡수)
├── contracts/           # Phase 1 — a11y·performance·save-feedback 검증 계약
│   ├── accessibility.md
│   ├── performance.md
│   └── save-feedback.md
└── checklists/
    └── requirements.md  # spec 품질(이미 16/16)
```

### Source Code (repository root)

```text
src/
├── app/
│   └── globals.css            # 수정: --danger 토큰 추가, --fg-faint 대비 상향
├── components/
│   ├── editor/
│   │   ├── StatusBar.tsx       # 수정: 성공/실패 토스트 시각 구분(role=status, --danger 보더)
│   │   ├── EditorScreen.tsx    # 수정: 대시보드 링크 dirty 가드(클라 네비)
│   │   └── FolderSelect.tsx    # --danger 정의로 정상화(코드 변경 없을 수 있음)
└── lib/
    └── markdown/pipeline.ts    # 무수정(검증만)

tests/
├── unit/
│   ├── a11y/contrast.test.ts        # 신규: 토큰 대비비 WCAG AA 검증
│   └── perf/render-budget.test.ts   # 신규: 1만자 renderMarkdown 시간 예산
└── conformance/markdown/sanitize.test.ts  # 기존 확장(추가 XSS 페이로드)
```

**Structure Decision**: 단일 웹앱. M7은 신규 디렉터리를 만들지 않고 기존 구조에 검증 테스트
2개(`a11y`·`perf`)와 소수정만 더한다. 플러그인/저장/렌더 코어는 건드리지 않아 회귀면을 최소화한다.

## Complexity Tracking

위반 없음 — 작성 불필요.
