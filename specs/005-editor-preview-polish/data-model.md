# Phase 1 Data Model: 에디터/프리뷰 보강 (M4)

새 영속 엔티티 없음(렌더·상호작용 보강 전용). 런타임 값만 기술.

## 런타임 값 (비영속)

| 값 | 타입 | 설명 |
|----|------|------|
| 에디터:프리뷰 비율 | number (panel %) | react-resizable-panels 내부 레이아웃 상태. 영속 안 함(범위 밖) |
| 스크롤 lock | boolean (모듈 내부) | 피드백 가드 — 프로그램적 스크롤 중 상대 이벤트 무시 |
| 스크롤 비율 r | number 0~1 | `scrollTop / (scrollHeight - clientHeight)` (순수 계산) |

## 순수 함수 시그니처

```typescript
// src/lib/scroll/syncScroll.ts
export function scrollRatio(el: { scrollTop: number; scrollHeight: number; clientHeight: number }): number;
export function targetScrollTop(ratio: number, el: { scrollHeight: number; clientHeight: number }): number;
export function canScroll(el: { scrollHeight: number; clientHeight: number }): boolean;
// 배선(부수효과): 두 엘리먼트 양방향 연결 + 정리 함수 반환
export function syncScroll(a: HTMLElement, b: HTMLElement): () => void;
```

## 상태 전이 (스크롤 동기화)

```text
A 스크롤 이벤트
  → lock이면 무시(되튐 방지)
  → canScroll(B) 아니면 무시
  → r = scrollRatio(A)
  → lock = true
  → B.scrollTop = targetScrollTop(r, B)
  → 다음 프레임(rAF)에 lock = false
(B 스크롤도 대칭 동작)
```

데이터 영속·이관 노트: 없음.
