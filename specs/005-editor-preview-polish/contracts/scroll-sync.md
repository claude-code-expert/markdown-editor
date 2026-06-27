# Contract: 스크롤 동기화 (`src/lib/scroll/syncScroll.ts`)

비율 계산은 순수 함수(테스트 가능), 엘리먼트 연결은 부수효과.

## 순수 함수 계약 (테스트 가능)

| # | 규칙 | 검증 |
|---|------|------|
| Y1 | `scrollRatio(el)` = `scrollTop / (scrollHeight - clientHeight)`, 분모 0 이하면 0 | 비율 0~1 |
| Y2 | `targetScrollTop(r, el)` = `r * (scrollHeight - clientHeight)` | 역산 일치 |
| Y3 | `canScroll(el)` = `scrollHeight - clientHeight > 0` | 스크롤 가능 판정 |
| Y4 | r=0 → target 0, r=1 → target 최대 | 경계 |
| Y5 | A→B 비율 동기 후 B의 비율이 A 비율과 ±오차 내 일치 | round-trip(SC-002) |

## 배선 계약 (부수효과)

| # | 규칙 | 검증 |
|---|------|------|
| Y6 | `syncScroll(a,b)` 양방향 연결, 정리 함수 반환 | 리스너 해제 |
| Y7 | 피드백 가드: 프로그램적 스크롤이 상대 이벤트를 되쏘지 않음(lock + rAF)(FR-005·SC-003) | 되튐 0 |
| Y8 | 스크롤 불가(canScroll=false) 영역은 동기화 건너뜀(FR-006) | 무오류 |

## 배선 위치

`EditorScreen` effect: `editor = controller.getScroller()`(= `view.scrollDOM`), `preview = previewRef`.
둘 다 준비되면 `const off = syncScroll(editor, preview)`; cleanup에서 `off()`.
