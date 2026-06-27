# Quickstart & Validation: 에디터/프리뷰 보강 (M4)

## 설치

```bash
npm i @codemirror/lang-markdown   # 에디터 마크다운 구문 강조
# react-resizable-panels 이미 설치됨
```

## 실행

```bash
npm run dev
npm test                              # 전체(기존 104 + M4)
npx vitest run tests/unit/scroll      # 스크롤 비율 동기화 순수 함수
npm run build
```

## 검증 시나리오

| # | 시나리오 | 조작 | 기대 | 출처 |
|---|---------|------|------|------|
| Z1 | 경계 리사이즈 | 에디터·프리뷰 경계 드래그 | 비율 변경, 최소 한계 멈춤 | SC-001, L1·L2 |
| Z2 | 리사이즈 후 렌더 | 비율 변경 후 입력 | 프리뷰 실시간 갱신 정상 | L3, FR-003 |
| Z3 | 스크롤 동기화 ↓ | 긴 문서 에디터 50% 스크롤 | 프리뷰 ≈50%(±10%) | SC-002, Y5 |
| Z4 | 스크롤 동기화 ↑ | 프리뷰 스크롤 | 에디터 비례 이동 | FR-004 |
| Z5 | 되튐 없음 | 빠른 연속 스크롤 | 무한 반동·깜빡임 0 | SC-003, Y7 |
| Z6 | 짧은 문서 | 스크롤 없는 문서 | 동기화 무시·무오류 | FR-006, Y8 |
| Z7 | 구문 강조 | `# 제목`·`**굵게**`·`` `코드` `` 입력 | 문법이 평문과 구분 강조 | SC-004, H1 |
| Z8 | 한글 성능 | 1만 자 한글 입력 | 리사이즈·동기화·강조 지연 무체감 | SC-005, H2 |
| Z9 | 회귀 | 툴바·활성표시·저장·다중문서 전환 | 기존 동작 그대로(104 통과) | SC-006 |
| Z10 | 접근성 | 핸들 키보드 + aria | 포커스·한글 레이블 | SC-007, L4 |

## 게이트 (병합 전)

- [ ] 스크롤 비율 동기화 순수 함수 Vitest 통과(헌법 IV) — Y1~Y5
- [ ] 기존 104 회귀 0(SC-006)
- [ ] 플러그인·파이프라인·sanitize 무변경(헌법 I·II) — H3
- [ ] 핸들 anti-slop·한글 aria(헌법 V·FR-010)

상세: [split-resize](./contracts/split-resize.md) · [scroll-sync](./contracts/scroll-sync.md) · [editor-highlight](./contracts/editor-highlight.md).
