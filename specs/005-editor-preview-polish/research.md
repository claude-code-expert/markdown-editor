# Phase 0 Research: 에디터/프리뷰 보강 (M4)

NEEDS CLARIFICATION 없음. 보강 3종을 기존 구조에 얹는 방법 결정.

## R1. 에디터:프리뷰 경계 리사이즈 — 중첩 Group

- **Decision**: 컨텐츠 Panel 내부의 고정 `flex` div를 `react-resizable-panels`의 **중첩 가로 Group**으로
  교체: `<Group orientation="horizontal">` → `Panel`(에디터, defaultSize "50%", minSize "25%") +
  `Separator`(md-resize-handle) + `Panel`(프리뷰, groupResizeBehavior preserve-relative-size).
- **Rationale**: 사이드바와 동일 메커니즘 재사용(학습·코드 일관). FR-001·002.
- **Alternatives considered**: CSS flex-basis 직접 드래그 구현 → 핸들·클램프·접근성 재발명. 기각.
- **주의**: 외곽 Group(사이드바|컨텐츠) 안에 중첩 → 중첩 Group 지원 확인됨(v4). Panel min은 % 또는 px.

## R2. 스크롤 동기화 — 비율 양방향 + 피드백 가드

- **Decision**: 스크롤 비율 `r = scrollTop / max(1, scrollHeight - clientHeight)`. 한쪽 스크롤 시 상대
  `target.scrollTop = r * (target.scrollHeight - target.clientHeight)`. **피드백 가드**: 프로그램적
  스크롤 직전 `lock` 설정 → 상대의 scroll 이벤트가 되쏘는 것을 무시(rAF로 다음 프레임에 해제).
- **Rationale**: 소스맵 없는 단순·견고한 비례 동기화. FR-004·005·006. 비율 계산은 순수 함수라 테스트 가능.
- **Alternatives considered**: 줄 단위 소스맵 매핑(정밀) → mdast position 추적·복잡. 본 마일스톤 과설계. 기각.
- **엣지(FR-006)**: `scrollHeight - clientHeight <= 0`(스크롤 불가)면 동기화 건너뜀.

## R3. 에디터 마크다운 구문 강조 — lang-markdown

- **Decision**: CM `extensions`에 `markdown()`(`@codemirror/lang-markdown`) 추가. 에디터 입력 영역에서
  제목·강조·코드·링크 등 문법이 CM 기본 하이라이트 스타일로 강조.
- **Rationale**: FR-007. 표준 CM 마크다운 언어 패키지로 최소 변경. 프리뷰 파이프라인과 무관(에디터 표시 전용).
- **Alternatives considered**: 커스텀 정규식 데코레이션 → 유지보수 부담. lang-markdown이 표준.
- **성능(FR-008)**: CM 점진적 파싱이라 대용량·한글 IME에 안정. basicSetup과 공존.

## R4. 스크롤 엘리먼트 노출·배선

- **Decision**: `MarkdownEditor`는 controller에 `getScroller()`(= `view.scrollDOM`) 추가. `Preview`는
  스크롤 컨테이너를 `forwardRef`로 노출. `EditorScreen`이 effect에서 두 엘리먼트를 잡아
  `syncScroll(editorEl, previewEl)` 연결(cleanup으로 리스너 해제).
- **Rationale**: 동기화 로직(순수 비율) ↔ DOM 배선(컴포넌트) 분리. 단일 책임.
- **Alternatives considered**: 전역 스토어에 스크롤 위치 보관 → 과한 리렌더. 직접 DOM 리스너가 가볍다.

## R5. 리사이즈와 실시간 렌더 공존

- **Decision**: 리사이즈는 레이아웃만 바꾸고 doc/렌더 상태 무관 → 기존 디바운스 렌더 그대로. CM은
  컨테이너 폭 변화 시 자동 재배치(lineWrapping). 회귀 0 목표(SC-006).
- **Rationale**: 레이아웃·렌더 직교. FR-003·009.

**Output**: 미해결 0. Phase 1 진행.
