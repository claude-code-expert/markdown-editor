# Quality Checklist: 에디터/프리뷰 보강 (M4) — 요구사항 품질

**Purpose**: 005 spec의 리사이즈·스크롤 동기화·구문강조 요구사항이 **명확·완전·일관·측정 가능**하게
작성됐는지 검증한다(구현 동작 검증 아님 — "요구사항에 대한 단위 테스트").
**Created**: 2026-06-27
**Feature**: [spec.md](../spec.md)
**Focus**: UX · 접근성 · 성능 · 회귀

## Requirement Completeness

- [ ] CHK001 리사이즈 최소·최대 너비 한계가 정량(픽셀/비율)으로 명시되었는가? [Clarity, Spec §FR-002]
- [ ] CHK002 리사이즈 핸들의 키보드 조작 방식(키·증분)이 요구로 정의되었는가, 아니면 외부 라이브러리에 암묵 위임됐는가? [Gap, Spec §FR-010]
- [ ] CHK003 구문 강조 대상 문법의 **최소 보장 집합**이 닫힌 목록으로 명시되었는가("…등"으로 열려 있지 않은가)? [Clarity, Spec §FR-007]
- [ ] CHK004 스크롤 동기화의 "비례 위치" 매핑 기준(스크롤 비율 vs 줄 단위)이 명시되었는가? [Completeness, Spec §FR-004]
- [ ] CHK005 비율·스크롤 상태의 영속(새로고침 후 유지) 포함/제외가 명시되었는가? [Coverage, Spec §Assumptions]
- [ ] CHK006 구문 강조 색상의 대비(가독성/접근성) 요구가 정의되었는가? [Gap, a11y]

## Requirement Clarity / Measurability

- [ ] CHK007 성능 기준 "입력 지연 무체감"이 정량 임계값(예: 입력→표시 ms, 프레임 예산)으로 표현되었는가? [Ambiguity, Spec §FR-008·SC-005]
- [ ] CHK008 "무한 반동(되튐) 없음"이 객관적으로 측정 가능한 기준으로 정의되었는가? [Measurability, Spec §FR-005·SC-003]
- [ ] CHK009 스크롤 동기화 허용 오차(±10%)가 SC와 FR 사이에서 일관되게 정량화되었는가? [Consistency, Spec §SC-002]
- [ ] CHK010 "최소 한계에서 멈춤"이 어느 너비에서 멈추는지 측정 가능하게 기술되었는가? [Measurability, Spec §SC-001]

## Requirement Consistency

- [ ] CHK011 FR-003(비율 조절 후 렌더 정상)과 FR-009(전체 회귀 0)의 범위 관계가 충돌 없이 정의되었는가? [Consistency, Spec §FR-003·FR-009]
- [ ] CHK012 리사이즈 핸들 명칭(Separator/리사이즈 핸들/`md-resize-handle`)이 문서 전반에서 일관되게 지칭되는가? [Consistency]
- [ ] CHK013 에디터:프리뷰 리사이즈가 사이드바 리사이즈와 동일 메커니즘·동일 접근성 수준으로 일관 규정됐는가? [Consistency, Spec §Assumptions]

## Scenario / Edge Coverage

- [ ] CHK014 스크롤 불가(짧은 문서) 영역에 대한 동기화 동작 요구가 정의되었는가? [Coverage, Spec §FR-006]
- [ ] CHK015 스크롤 동기화 중 동시 입력(타이핑+스크롤) 시 깜빡임/되튐 방지 요구가 정의되었는가? [Edge Case, Spec §Edge Cases]
- [ ] CHK016 창이 매우 좁을 때 양쪽 영역 최소 너비 보존 요구가 정의되었는가? [Edge Case, Spec §FR-002]
- [ ] CHK017 한글 입력(IME 조합)·대용량 문서에서 구문 강조 성능 요구가 명시되었는가? [Coverage, Spec §FR-008]

## Non-Functional (접근성 / 성능)

- [ ] CHK018 리사이즈 핸들의 한글 접근성 레이블·키보드 포커스 요구가 명시되었는가? [Coverage, Spec §FR-010·SC-007]
- [ ] CHK019 성능 요구가 측정 가능한 기준 문서(어떤 조작·어떤 문서 크기·어떤 지표)로 정의되었는가? [Measurability, Spec §SC-005]
- [ ] CHK020 본 보강이 기존 기능(렌더·툴바·활성표시·저장·다중문서)을 깨지 않음을 검증할 회귀 범위가 명시되었는가? [Coverage, Spec §SC-006]

## Dependencies & Assumptions

- [ ] CHK021 리사이즈 라이브러리가 키보드 리사이즈를 기본 제공한다는 가정이 검증/문서화되었는가? [Assumption, Spec §FR-010]
- [ ] CHK022 에디터 구문 강조가 렌더 파이프라인(프리뷰 HTML)과 무관함이 요구로 명시되었는가? [Assumption, contracts/editor-highlight.md H3]
- [ ] CHK023 코드블록 언어 하이라이트·수식(KaTeX)·비율 영속의 범위 제외가 명시적으로 기록되었는가? [Coverage, Spec §Assumptions]

## Acceptance Criteria Quality

- [ ] CHK024 각 Success Criteria(SC-001~007)가 구현 비종속·측정 가능 형태인가(특히 SC-005 성능)? [Acceptance Criteria, Spec §Success Criteria]
- [ ] CHK025 각 FR이 적어도 하나의 측정 가능한 수용 시나리오(Z/Y/L/H)로 추적되는가? [Traceability, Spec §FR·quickstart]

## Notes

- 이 체크리스트는 **요구사항이 잘 쓰였는지**를 점검한다(구현 통과 여부는 tasks.md·quickstart Z 시나리오 담당).
- 미충족 항목 = spec 보강 후보. 특히 CHK001·CHK002·CHK007(analyze MEDIUM U1·M1과 연계)은 plan/spec 정량화 권장.
