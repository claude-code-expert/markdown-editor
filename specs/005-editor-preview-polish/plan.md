# Implementation Plan: 에디터/프리뷰 보강 (M4)

**Branch**: `feature/init` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-editor-preview-polish/spec.md`

## Summary

기존 컨텐츠 영역의 고정 50:50 에디터|프리뷰를 **중첩 리사이즈 Group**으로 바꿔 경계 드래그를 지원하고
(A-6), 에디터 스크롤러와 프리뷰 컨테이너의 **스크롤 비율을 양방향 동기화**하며(A-7, 피드백 가드),
CodeMirror에 **마크다운 구문 강조**(`@codemirror/lang-markdown`)를 추가한다. 렌더 파이프라인·플러그인·
저장은 변경하지 않는다.

## Technical Context

**Language/Version**: TypeScript 5 (계승)
**Primary Dependencies**: 기존 + `@codemirror/lang-markdown` 6.5.0(신규, 에디터 구문 강조).
`react-resizable-panels`(이미 설치) 중첩 Group 재사용. 렌더·파서·저장 무변경.
**Storage**: 변경 없음. 비율·스크롤 상태 영속은 범위 밖(선택).
**Testing**: Vitest — 스크롤 비율 동기화 순수 함수(`scrollSync` 비율 계산) 단위 테스트. 기존 104 회귀 0.
리사이즈·구문강조는 런타임/시각(브라우저) 검증.
**Target Platform**: 모던 브라우저, Vercel 정적, 클라이언트 런타임.
**Project Type**: Web app — 레이아웃 중첩 + CM 확장 + 스크롤 동기화 훅 추가.
**Performance Goals**: 1만 자 문서에서 리사이즈·동기화·구문강조가 입력 지연 무체감(SC-005). 스크롤
동기화 ±10%(SC-002), 되튐 0(SC-003).
**Constraints**: 회귀 0(SC-006), 한글 aria 핸들(FR-010), anti-slop(핸들 재사용), 피드백 루프 방지(FR-005).
**Scale/Scope**: 분할 1개 추가 + 스크롤 동기화 + 구문강조. 새 데이터 없음.

## Constitution Check

| # | 원칙 | 게이트 | 판정 |
|---|------|--------|------|
| I | 플러그인 격리 | 툴바·플러그인·파이프라인 무수정 | ✅ 레이아웃·CM·동기화만 변경 |
| II | Sanitize | 렌더 경로 무변경 | ✅ |
| III | SDD | spec→plan | ✅ |
| IV | TDD (Vitest) | 순수 로직 테스트 | ✅ 스크롤 비율 동기화 순수 함수 단위 테스트 |
| V | 무장식 디자인 | 분할 핸들 anti-slop | ✅ `md-resize-handle` 재사용 |

**위반 없음.** Complexity Tracking 비움.

## Project Structure

```text
specs/005-editor-preview-polish/
├── plan.md · research.md · data-model.md · quickstart.md
├── contracts/
│   ├── split-resize.md     # 중첩 리사이즈 Group(에디터|프리뷰)
│   ├── scroll-sync.md      # 스크롤 비율 양방향 동기화 + 피드백 가드
│   └── editor-highlight.md # CM 마크다운 구문 강조
└── checklists/requirements.md
```

### Source Code (수정/추가)

```text
src/components/editor/
├── EditorScreen.tsx     # [수정] 컨텐츠 div → 중첩 Group(Panel 에디터 | Separator | Panel 프리뷰)
├── MarkdownEditor.tsx   # [수정] lang-markdown 확장 추가 + controller에 getScroller() 노출
└── Preview.tsx          # [수정] 스크롤 컨테이너 ref 노출(forwardRef)

src/lib/scroll/
└── syncScroll.ts        # [신규] 순수: 스크롤 비율 계산 + 양방향 연결(피드백 가드)

src/components/editor/controller.ts  # [수정] EditorController += getScroller()

tests/unit/scroll/
└── sync-scroll.test.ts  # [신규] 비율 계산·가드 단위 테스트
```

**Structure Decision**: 컨텐츠 Panel(외곽 사이드바 Group의 두 번째 Panel) 내부의 고정 `flex` div를
**중첩 가로 Group**으로 교체한다(에디터 Panel | Separator | 프리뷰 Panel). react-resizable-panels는
중첩 Group을 지원한다. 스크롤 동기화는 비율 계산을 순수 함수(`syncScroll.ts`)로 분리해 Vitest로
검증하고, 두 스크롤 엘리먼트(에디터 `view.scrollDOM`, 프리뷰 컨테이너) 연결은 EditorScreen에서 effect로
배선한다. 구문 강조는 CM `extensions`에 `markdown()` 추가(파이프라인 무관, 에디터 표시 전용).

## Complexity Tracking

> 위반 없음 — 비움.
