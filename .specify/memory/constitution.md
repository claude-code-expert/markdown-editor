<!--
SYNC IMPACT REPORT
==================
Version change: TEMPLATE (unratified) → 1.0.0
Bump rationale: Initial ratification. First concrete fill of the placeholder
  template; all five principles and governance defined for the first time.

Principles defined (1.0.0):
  I.   플러그인 격리 & 순수 함수 (Plugin Isolation & Purity)
  II.  Sanitize-Always 렌더 파이프라인 (NON-NEGOTIABLE)
  III. 명세 우선 개발 — SDD (NON-NEGOTIABLE)
  IV.  테스트 우선 — TDD with Vitest
  V.   무장식 디자인 규율 (Anti-Slop Visual Discipline)

Added sections:
  - 기술 스택 & 범위 제약 (Section 2)
  - 개발 워크플로 (Section 3)
  - Governance

Removed sections: none (template placeholders replaced in place)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate is generic
       ("[Gates determined based on constitution file]"); no principle names
       hardcoded, so it consumes this file as-is. No edit required.
  ✅ .specify/templates/spec-template.md — no constitution references. No edit.
  ✅ .specify/templates/tasks-template.md — no constitution references. No edit.
  ✅ CLAUDE.md — source of these principles; already consistent.

Deferred TODOs: none.
-->

# Markdown Editor Constitution

## Core Principles

### I. 플러그인 격리 & 순수 함수 (Plugin Isolation & Purity)

툴바의 각 마크다운 동작(굵게/H1/링크 등)은 `src/plugins/<tag>.ts` **독립 모듈 1개**로
구현하며, 모두 동일한 `MarkdownPlugin` 인터페이스를 구현한다. 새 태그 추가는 파일 1개 작성
+ `plugins/index.ts` 레지스트리 배열에 1줄 추가로 완결되어야 한다.

- 에디터 코어·툴바 컴포넌트는 플러그인 추가/변경 시 **절대 수정하지 않는다**(격리 불변식).
- `apply(state)` 및 `isActive(state)`는 **순수 함수**여야 한다 (`EditorState → EditorChange`).
  CodeMirror·React에 의존 금지 — 프레임워크 비종속이라야 Vitest 단위 테스트가 가능하다.
- 4가지 동작 타입(선택 감싸기 / 줄 접두 / 블록 삽입 / 입력 다이얼로그)은 `plugins/helpers.ts`의
  공통 헬퍼(`wrapSelection`·`toggleLinePrefix` 등)로 수렴시킨다 — 동작 로직 중복 금지.

**Rationale**: 기능 확장 비용을 "파일 1개 + 1줄"로 고정하고, 코어 회귀 위험을 0으로 만든다.
순수 함수 강제는 테스트 가능성과 격리를 동시에 보장하는 단일 메커니즘이다.

### II. Sanitize-Always 렌더 파이프라인 (NON-NEGOTIABLE)

프리뷰 렌더는 다음 unified 파이프라인을 고정 순서로 통과해야 한다:

```
입력(md) → remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify → DOM
```

- `rehype-sanitize`는 **생략 불가**다 (XSS 방어, NFR-1). 사용자가 원시 HTML을 입력할 수
  있으므로 렌더 직전 정제는 협상 대상이 아닌 보안 요구사항이다.
- CommonMark 코어와 GFM 확장(표·취소선·작업목록·자동링크 리터럴)을 코드·문서에서 혼동하지
  않는다. GFM 확장은 `remark-gfm`을 통해서만 활성화한다.
- 문법→HTML 기대값의 단일 출처는 `docs/markdown-editor-spec.md`다.

**Rationale**: 정제 단계를 "필수 통과 게이트"로 못 박아 XSS 회귀를 구조적으로 차단한다.
파이프라인 순서를 계약으로 고정해야 플러그인·테스트가 동일한 렌더 결과를 가정할 수 있다.

### III. 명세 우선 개발 — SDD (NON-NEGOTIABLE)

코드보다 명세가 앞선다. 신규 기능은 spec 없이 구현하지 않는다.

- 워크플로: `/speckit.constitution → /speckit.specify → /speckit.clarify → /speckit.plan →
  /speckit.tasks → /speckit.implement`. 구현 착수 전 `/speckit.analyze`로 정합성을 점검한다.
- 산출물은 `specs/<feature>/{spec,plan,tasks}.md`에 위치한다.
- 확정 사항(스택·범위·플러그인 계약)은 계약으로 취급하며, 변경은 명세 갱신을 선행해야 한다.

**Rationale**: 그린필드 단계에서 명세를 코드의 진실 원천으로 고정하면, 구현 산출물이 항상
검증 가능한 기준을 갖는다. spec 없는 구현은 검증 불가능한 부채다.

### IV. 테스트 우선 — TDD with Vitest

순수 로직(플러그인 `apply`/`isActive`, 마크다운 변환, 헬퍼)은 테스트를 먼저 작성한다.

- Red → Green → Refactor 주기를 따른다 (실패 테스트 → 최소 구현 → 행위 불변 정리).
- 플러그인은 프레임워크 비종속 순수 함수이므로 Vitest 단위 테스트로 100% 커버 가능해야 한다.
- 마크다운 변환 테스트의 기대값 출처는 `docs/markdown-editor-spec.md`로 단일화한다.
- 단일 테스트 실행: `npx vitest run <path>` · 전체: `npm test`.

**Rationale**: 순수 함수 설계(원칙 I)는 TDD를 값싸게 만든다. 두 원칙은 상호 강화 관계이며,
명세의 기대값(원칙 III)을 실행 가능한 검증으로 환원한다.

### V. 무장식 디자인 규율 (Anti-Slop Visual Discipline)

모든 UI·HTML·SVG·슬라이드 산출물은 `.claude/rules/anti-ai-slop.md`를 **강제** 준수한다.

- 금지: 그라데이션 일체, 컬러 그림자·글로우·`backdrop-filter` 글래스모피즘, 장식 모션
  (hover transform / load fade / pulse·shimmer·glow), 배경 워터마크·그리드·광선, 카드 상단
  컬러 액센트 바, 이모지 불릿, 마케팅 상투어.
- 강제: 무채색 베이스 + 액센트 1색(파랑 `#3b5bdb`), 위계는 크기·여백·정렬·타이포로만 구성,
  구획은 `1px solid border` + 여백, `border-radius` 0–8px. 폰트는 의도적으로 선택
  (Pretendard 본문 / JetBrains Mono 에디터·코드) — system 기본값 수렴 금지.
- 디자인 레퍼런스(`docs/design/.../Markdown Editor.dc.html`)는 **시각만 픽셀 매칭**하고
  내부 구조(textarea·정규식 렌더러)는 복제하지 않는다.

**Rationale**: 모든 시각 요소는 "어떤 정보를 전달하는가"에 답할 수 있어야 한다. 장식이 아닌
정보 위계로 품질을 만드는 규칙을 헌법 수준으로 못 박아 산출물 일관성을 보장한다.

## 기술 스택 & 범위 제약

**확정 스택(2026-06 결정, 협상 대상 아님)**: Next.js 16 (App Router) + React 19 +
TypeScript 5 + Tailwind CSS 4 + CodeMirror 6 + unified(remark/rehype) + IndexedDB(`idb`)
+ Zustand. 근거·버전은 `docs/requirement.md §0–1`.

**범위 — 단계적 마일스톤**:
- M1 = 단일 화면 에디터(툴바 + 에디터 50 : 프리뷰 50 + 로컬 저장). **여기부터 시작한다.**
- 사이드바·폴더 트리·대시보드·다중 문서는 후속 마일스톤으로 미룬다.
- 전체 비전은 `docs/PRD.md`, 기술 설계는 `docs/TRD.md`를 진실 원천으로 삼는다.

**저장소 정책**:
- 영속화 모델은 IndexedDB(`folders`/`documents` 스토어, `documents.folderId → folders.id` 1:N).
  스키마는 `docs/requirement.md §6`.
- **M1 예외**: 단일 화면 단계는 `localStorage`(`mdeditor:v1`)로 시작해도 무방하다. 폴더 기능
  도입 시 IndexedDB로 이관한다.

## 개발 워크플로

- **스펙 게이트**: spec → plan → tasks가 존재하지 않는 기능은 구현하지 않는다(원칙 III).
- **플러그인 게이트**: 신규 마크다운 태그 PR은 (a) 독립 파일 1개, (b) 레지스트리 1줄 추가,
  (c) 코어 무수정, (d) Vitest 단위 테스트 동반을 모두 충족해야 병합한다(원칙 I·IV).
- **보안 게이트**: 프리뷰 렌더 경로에서 `rehype-sanitize` 제거·우회 변경은 병합 불가(원칙 II).
- **디자인 게이트**: UI 산출물은 `anti-ai-slop.md` 자가 점검을 통과해야 한다(원칙 V).
- 문서 내 다이어그램은 PlantUML 대신 트리+표 텍스트 표기를 쓴다.

## Governance

이 헌법은 본 저장소의 다른 모든 관행에 우선한다.

- **개정 절차**: 원칙·게이트 변경은 (1) 변경 사유 문서화, (2) 영향받는 명세·템플릿 동기화,
  (3) 아래 버전 정책에 따른 버전 증가를 선행해야 한다.
- **버전 정책 (유의적 버전)**:
  - MAJOR — 원칙의 하위 호환 불가 제거·재정의 또는 거버넌스 변경.
  - MINOR — 새 원칙/섹션 추가 또는 지침의 실질적 확장.
  - PATCH — 표현 명료화·오타 수정 등 비의미적 다듬기.
- **준수 검토**: 모든 PR/리뷰는 위 게이트 충족을 확인한다. 복잡도 추가는 정당화되어야 하며,
  정당화 못 하는 요소는 제거한다.
- **런타임 개발 지침**: 일상 작업 가이드는 `CLAUDE.md`를 따른다(본 헌법과 충돌 시 헌법 우선).

**Version**: 1.0.0 | **Ratified**: 2026-06-26 | **Last Amended**: 2026-06-26
