# Implementation Plan: 플러그인 완성 — 전체 마크다운 툴바 (M2)

**Branch**: `feature/init` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-full-markdown-toolbar/spec.md`

## Summary

M1의 플러그인 아키텍처(`src/plugins/`, `MarkdownPlugin` 계약) 위에 누락 태그 5종(굵은 기울임·참조
링크·자동 링크·강제 줄바꿈·Setext)을 독립 모듈로 추가하고, 툴바 코어를 확장해 (a) 서식 활성 표시
(isActive 하이라이트), (b) 코드 블록 언어 지정, (c) 표 행/열·정렬 편집을 제공한다. 렌더 파이프라인은
변경하지 않는다(M1이 이미 코어+GFM 전체 렌더). 다이얼로그 계약을 단일 입력 → 다중 필드로 진화시켜
참조 링크(식별자+URL)·코드 언어를 수용한다.

## Technical Context

**Language/Version**: TypeScript 5.x (M1 계승)

**Primary Dependencies**: 기존 M1 스택 그대로 — Next.js 16 · React 19 · CodeMirror 6 · unified ·
Zustand · lucide-react · Vitest. **신규 런타임 의존성 없음**(렌더·파서 변경 없음). 코드 구문
하이라이트 테마(`rehype-highlight` 등)는 선택 사항으로 본 마일스톤 필수 아님.

**Storage**: 변경 없음 — M1 `localStorage(mdeditor:v1)` 단일 문서 계승.

**Testing**: Vitest — 신규 플러그인 `apply`/`isActive`, 표 연산(`tableOps`), 참조 정의 삽입을 순수
함수 단위 테스트. 기대값 출처 `docs/markdown-editor-spec.md`.

**Target Platform**: M1과 동일(모던 브라우저, Vercel 정적, 클라이언트 런타임).

**Project Type**: Web application (기존 단일 Next.js 프로젝트에 모듈·컴포넌트 추가).

**Performance Goals**: 활성 표시(isActive) 계산이 커서 이동을 지연시키지 않음(SC-002 ≤0.1초). 큰
문서에서도 선택 변경 → 활성 갱신이 즉시 체감.

**Constraints**: 신규 태그는 파일 1개 + 레지스트리 1줄, 파서·CM 어댑터 무수정(FR-012, 헌법 I).
툴바 코어 기능 확장(활성표시·표/언어 UI)은 태그 격리와 별개로 허용. anti-slop·한글 aria 계승.

**Scale/Scope**: 신규 플러그인 5종 + 표 편집 액션 3종(행/열/정렬) + 코드 언어 + 활성표시 인프라.
단일 화면·단일 문서 유지.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | 원칙 | 게이트 | 초기 | Phase 1 |
|---|------|--------|------|---------|
| I | 플러그인 격리 & 순수 함수 | 신규 태그 = 파일1+레지스트리1줄, 파서·CM어댑터 무수정 | ✅ PASS | ✅ PASS — 신규 5 플러그인 격리. **활성표시·표/언어 UI는 "태그 추가"가 아닌 툴바 코어 기능 확장 → FR-012가 명시 허용**(격리 위반 아님) |
| II | Sanitize-Always (NON-NEGOTIABLE) | 렌더 경로 sanitize 유지 | ✅ PASS | ✅ PASS — 파이프라인 무변경 |
| III | 명세 우선 SDD (NON-NEGOTIABLE) | spec→plan 순서 | ✅ PASS | ✅ PASS |
| IV | 테스트 우선 (Vitest TDD) | 순수 로직 테스트 동반 | ✅ PASS | ✅ PASS — 플러그인·tableOps·참조삽입 단위 테스트 |
| V | 무장식 디자인 규율 | 신규 UI anti-slop 준수 | ✅ PASS | ✅ PASS — M1 디자인 토큰 재사용 |

**위반 없음** → Complexity Tracking 비움. 활성표시/표/언어 UI의 코어 수정은 헌법 I 위반이 아니라
FR-012가 명시한 **승인된 범위**(태그 격리 ≠ 툴바 기능 동결)이므로 게이트 통과.

## Project Structure

### Documentation (this feature)

```text
specs/002-full-markdown-toolbar/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── plugin-contract-v2.md   # apply 다중필드 입력 + isActive 활성표시 표면
│   ├── table-ops.md            # 표 행/열/정렬 순수 연산
│   └── reference-link.md       # 참조 링크 삽입 + 정의 자동 수집
├── checklists/requirements.md
└── tasks.md (← /speckit-tasks)
```

### Source Code (기존 M1 트리에 추가/확장)

```text
src/plugins/
├── types.ts            # [확장] apply(state, inputs?: Record<string,string>) 다중필드 + dialog.fields
├── helpers.ts          # [확장] insertAtLineEnd(하드브레이크), appendReferenceDef(참조정의)
├── index.ts            # [확장] 신규 5 플러그인 레지스트리 등록(각 1줄)
├── boldItalic.ts       # [신규] *** 굵은 기울임
├── referenceLink.ts    # [신규] [t][id] + 하단 정의 — 전체 doc 다루는 순수함수
├── autolink.ts         # [신규] <url>
├── hardBreak.ts        # [신규] 줄 끝 강제 줄바꿈
├── setextHeading.ts    # [신규] 다음 줄 ===/--- 밑줄
└── (codeBlock.ts)      # [확장] 언어 인자 수용

src/lib/markdown/
└── tableOps.ts         # [신규] 순수: addRow·addColumn·setAlign(표 블록 파싱·재조립)

src/components/editor/
├── Dialog.tsx          # [신규/대체] 다중 필드 다이얼로그(LinkDialog 일반화)
├── Toolbar.tsx         # [확장] activeIds 구독해 버튼 활성표시 + 표/언어 컨텍스트 액션
├── MarkdownEditor.tsx  # [확장] CM selection 변경 → activeIds 계산해 store push
└── controller.ts       # [확장] applyPlugin(plugin, inputs?) 다중필드

src/lib/store/
└── useEditorStore.ts   # [확장] activeIds: string[] (선택 변경 시 갱신)

tests/unit/plugins/     # 신규 플러그인 apply/isActive
tests/unit/markdown/    # tableOps, referenceLink 삽입
```

**Structure Decision**: M1 격리 구조를 그대로 계승한다. 신규 태그 5종은 `src/plugins/<tag>.ts`
+ `index.ts` 1줄(파서·CM 어댑터 무수정). 활성표시·표/언어 UI는 spec FR-012가 승인한 툴바 코어
확장이므로 `Toolbar`·`MarkdownEditor`·`useEditorStore`·`Dialog`를 수정한다 — 단 이는 "새 태그
추가"가 아니라 "툴바 기능 추가"라 헌법 I 격리 불변식과 충돌하지 않는다. 표 연산은 프레임워크
비종속 순수 함수(`tableOps.ts`)로 분리해 Vitest 단위 테스트한다.

## Complexity Tracking

> 위반 없음 — 비움. (활성표시/표/언어 코어 확장은 FR-012 승인 범위)
