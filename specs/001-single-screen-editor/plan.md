# Implementation Plan: 단일 화면 마크다운 에디터 (M1)

**Branch**: `feature/init` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-single-screen-editor/spec.md`

## Summary

단일 화면(툴바 + 에디터 50 : 프리뷰 50 + 하단 상태바·저장)의 마크다운 에디터를 구현한다.
CodeMirror 6 에디터 입력을 unified(remark/rehype) 파이프라인으로 실시간 렌더하고, 툴바 버튼은
처음부터 `MarkdownPlugin` 순수 함수 계약 위에 구현한다(헌법 원칙 I). 영속화는 M1 한정으로
`localStorage(mdeditor:v1)` 단일 문서로 시작하며, 첫 방문 시 간결한 온보딩 샘플을 시드한다(FR-018).
`rehype-sanitize`는 렌더 경로의 필수 게이트(헌법 원칙 II).

## Technical Context

**Language/Version**: TypeScript 5.x

**Primary Dependencies**: Next.js 16.2.x (App Router) · React 19 · Tailwind CSS 4 ·
CodeMirror 6 (`codemirror`, `@codemirror/*`) · unified(`remark-parse`, `remark-gfm`,
`remark-rehype`, `rehype-sanitize`, `rehype-stringify`) · `lucide-react` · Zustand ·
`react-resizable-panels`(권장 A-6용)

**Storage**: M1 = `localStorage` 키 `mdeditor:v1`(단일 문서). 폴더 도입(M3) 시 IndexedDB(`idb`)로 이관.

**Testing**: Vitest — 플러그인 `apply()`/`isActive()` 순수함수 단위 테스트 + 파이프라인 conformance 테스트.

**Target Platform**: 모던 브라우저(데스크톱 우선), Vercel 정적 호스팅, 런타임 전부 클라이언트(서버 의존 없음).

**Project Type**: Web application (프론트엔드 전용 Next.js 단일 프로젝트, 백엔드 없음).

**Performance Goals**: 입력→프리뷰 갱신 디바운스 ≤150ms(SC-001), 1만 자 문서에서 입력 지연 무체감(SC-002).

**Constraints**: 프리뷰 sanitize 생략 불가(NFR-1), 툴바 한글 `aria-label`+키보드 포커스(NFR-3),
한글 IME 조합 중 단축키·렌더 비충돌, anti-ai-slop 디자인 규칙 준수.

**Scale/Scope**: 단일 화면 1개, 단일 문서 1건, 툴바 플러그인 약 14종(제목 H1–H6는 팩토리 1개로 생성).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | 원칙 | 게이트 | 초기 판정 | Phase 1 재판정 |
|---|------|--------|----------|----------------|
| I | 플러그인 격리 & 순수 함수 | 툴바 = `MarkdownPlugin` 파일1개+레지스트리1줄, 코어 무수정, `apply`/`isActive` 순수 | ✅ PASS | ✅ PASS — `contracts/markdown-plugin.md` 계약으로 고정 |
| II | Sanitize-Always 파이프라인 (NON-NEGOTIABLE) | 렌더 경로에 `rehype-sanitize` 필수 | ✅ PASS | ✅ PASS — `contracts/markdown-pipeline.md`에 게이트 명시 |
| III | 명세 우선 SDD (NON-NEGOTIABLE) | spec→clarify 완료 후 plan | ✅ PASS | ✅ PASS |
| IV | 테스트 우선 (Vitest TDD) | 순수 로직 테스트 동반 | ✅ PASS | ✅ PASS — conformance 기대값 출처 `markdown-editor-spec.md` |
| V | 무장식 디자인 규율 | UI 산출물 anti-ai-slop 준수 | ✅ PASS | ✅ PASS — 시각만 디자인 레퍼런스 매칭 |

**위반 없음** → Complexity Tracking 비움. 게이트 통과, Phase 0 진행.

## Project Structure

### Documentation (this feature)

```text
specs/001-single-screen-editor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── markdown-plugin.md     # MarkdownPlugin 인터페이스 계약
│   ├── markdown-pipeline.md   # 입력 md → 안전 HTML 계약
│   └── storage.md             # localStorage 영속 계약
├── checklists/
│   └── requirements.md  # spec 품질 체크리스트
└── tasks.md             # /speckit-tasks 출력(미생성)
```

### Source Code (repository root)

`create-next-app --ts --tailwind --app --src-dir`로 스캐폴딩한 단일 Next 프로젝트.
헌법·CLAUDE.md 계약대로 `src/plugins/<tag>.ts` 격리 구조를 채택한다.

```text
src/
├── app/
│   ├── layout.tsx           # 루트 레이아웃(폰트: Pretendard/JetBrains Mono)
│   ├── page.tsx             # M1 단일 화면 에디터(루트 "/")
│   └── globals.css          # Tailwind + 디자인 토큰(액센트 #3b5bdb)
├── components/
│   └── editor/
│       ├── EditorScreen.tsx     # 화면 조립(툴바+에디터+프리뷰+상태바)
│       ├── Toolbar.tsx          # 레지스트리 순회 렌더 — 코어, 플러그인에 무지
│       ├── MarkdownEditor.tsx   # CodeMirror 6 래퍼 + EditorState 어댑터
│       ├── Preview.tsx          # 파이프라인 결과 HTML 렌더
│       ├── StatusBar.tsx        # 문자수·줄수 + 저장/취소
│       └── LinkDialog.tsx       # 링크·이미지 URL 입력
├── plugins/
│   ├── types.ts             # MarkdownPlugin, EditorState, EditorChange
│   ├── helpers.ts           # wrapSelection, toggleLinePrefix, insertBlock
│   ├── index.ts             # 레지스트리 배열(=툴바 순서)
│   ├── heading.ts           # createHeadingPlugin(1..6) 팩토리
│   ├── bold.ts  italic.ts  strikethrough.ts  inlineCode.ts
│   ├── codeBlock.ts  blockquote.ts  hr.ts  table.ts
│   ├── bulletList.ts  orderedList.ts  taskList.ts
│   └── link.ts  image.ts
└── lib/
    ├── markdown/
    │   └── pipeline.ts      # remark+rehype, sanitize 포함
    ├── storage/
    │   └── local.ts         # load/save(mdeditor:v1), 시드 로직
    ├── store/
    │   └── useEditorStore.ts # Zustand: doc·savedDoc·dirty
    └── constants/
        └── seed.ts          # 온보딩 샘플 마크다운(FR-018)

tests/
├── unit/
│   └── plugins/             # apply()/isActive() 순수함수 테스트(CM6·React 불필요)
└── conformance/
    └── markdown/            # 파이프라인 HTML 기대값(markdown-editor-spec.md 출처)
```

**Structure Decision**: 프론트엔드 전용 단일 Next.js 프로젝트(백엔드 없음)이므로 web-app의
backend/frontend 분리는 채택하지 않는다. CLAUDE.md 핵심 원칙이 명시한 `src/plugins/<tag>.ts`
격리 경로를 그대로 따른다 — 새 태그 = 파일 1개 + `index.ts` 1줄, 코어(Toolbar/MarkdownEditor)
무수정. M1 단일 화면은 루트 라우트 `/`(app/page.tsx)에 둔다. `/editor/[docId]` 라우팅은 M4 범위.

## Complexity Tracking

> 위반 없음 — 비움.
