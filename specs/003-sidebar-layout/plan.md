# Implementation Plan: 레이아웃 — 사이드바 + 리사이즈 (M2)

**Branch**: `feature/init` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

## Summary

`EditorScreen`을 재구성해 상단바·상태바는 전체 폭, 그 사이를 `react-resizable-panels`의 가로
`PanelGroup`으로 [사이드바 | 컨텐츠(툴바·에디터·프리뷰)] 2분할한다. 사이드바는 `[+] 폴더 생성`
자리 + 트리 영역(M2는 빈 상태)을 와이어프레임 구조로 렌더. 데이터·CRUD는 M3.

## Technical Context

**Language/Version**: TypeScript 5 (계승)
**Primary Dependencies**: 기존 + `react-resizable-panels` 4.11.2(신규). 렌더·파서·저장 무변경.
**Storage**: 변경 없음(M2는 데이터 없음).
**Testing**: Vitest — Sidebar 컴포넌트 렌더 테스트(빈 상태·aria·[+] 자리). 기존 88 회귀 0.
**Project Type**: Web app (컴포넌트 추가 + EditorScreen 재배치).
**Performance/Constraints**: 리사이즈가 에디터·프리뷰 동작 비차단, anti-slop·한글 aria 계승.
**Scale/Scope**: 사이드바 1개 + 리사이즈. 폴더/문서 데이터 없음.

## Constitution Check

| 원칙 | 게이트 | 판정 |
|------|--------|------|
| I 플러그인 격리 | 툴바/플러그인 무수정 | ✅ 사이드바는 플러그인 무관, 코어 레이아웃만 |
| II Sanitize | 렌더 경로 무변경 | ✅ |
| III SDD | spec→plan | ✅ |
| IV TDD | UI 렌더 테스트 | ✅ Sidebar 단위 렌더 테스트 |
| V 무장식 | 사이드바 anti-slop | ✅ M1 토큰 재사용, 그라데이션·컬러그림자 없음 |

**위반 없음.**

## Project Structure

```text
src/components/editor/
├── Sidebar.tsx          # [신규] [+] 폴더생성 자리 + 트리 영역(빈 상태)
└── EditorScreen.tsx     # [재구성] PanelGroup으로 사이드바|컨텐츠 2분할 + 리사이즈
src/app/globals.css       # [확장] 사이드바·리사이즈 핸들 스타일(중성 1px)
tests/unit/components/
└── sidebar.test.tsx     # [신규] Sidebar 렌더(빈 상태·aria·버튼)
```

**Structure Decision**: 사이드바는 레이아웃 코어라 `components/editor/`에 둔다(M3에서 `FolderTree`
등 분리). `react-resizable-panels`의 `PanelGroup`/`Panel`/`PanelResizeHandle`로 % 기반 리사이즈.
상단바·상태바는 PanelGroup 밖(전체 폭), 그 사이만 분할.

## Complexity Tracking

> 위반 없음 — 비움.
