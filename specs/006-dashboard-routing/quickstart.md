# Quickstart & Validation: 문서 흐름 (M6)

## 전제

신규 의존성 없음(Next App Router 동적 라우트 사용). M3 저장소·M5 에디터 위에 얹는다.

## 실행

```bash
npm run dev
npm test                              # 전체(기존 110 + M6)
npx vitest run tests/unit/util        # uniqueTitle 순수 함수
npx vitest run tests/unit/store       # moveDocument
npm run build
```

## 검증 시나리오

| # | 시나리오 | 조작 | 기대 | 출처 |
|---|---------|------|------|------|
| W1 | 대시보드 진입 | `/` 진입 | 저장된 전 문서 리스트(제목·폴더·수정시각) | SC-001, D1·D2 |
| W2 | 문서 열기 | 리스트 항목 클릭 | `/editor/[id]` 이동·로드(≤0.5초) | SC-002, D3·R2 |
| W3 | 빈 대시보드 | 문서 0 | 빈 상태 안내 + 시작 수단 | D4 |
| W4 | 직접 주소 | `/editor/[id]` 직접 진입 | 그 문서 로드 | SC-003, R2 |
| W5 | 새로고침 유지 | 에디터에서 새로고침 | 같은 문서 유지 | SC-003, R3 |
| W6 | 없는 주소 | 잘못된 docId 진입 | 안내 + 대시보드 복귀, 앱 무파손 | SC-006, R4 |
| W7 | 폴더 선택 저장 | 상단 폴더 선택 → 저장 | 해당 폴더 저장·성공 토스트 | SC-005, F4 |
| W8 | 미선택 차단 | 폴더 없음 상태 저장 시도 | 차단 + 안내 | SC-004, F3 |
| W9 | 중복 제목 | 같은 폴더 같은 제목 저장 | 접미사(`-1`) 구분 | FR-009, F5·U2 |
| W10 | 사이드바 클릭 | 사이드바 문서 클릭 | `/editor/[id]` 네비·URL 일치 | R6 |
| W11 | dirty 이동 경고 | 미저장 변경 후 대시보드 이동 | 경고 | FR-010, R7 |
| W12 | 회귀 | 에디터·툴바·저장·다중문서·리사이즈 | 기존 동작 그대로(110 통과) | SC-007 |
| W13 | 접근성 | 대시보드·셀렉터 키보드 + aria | 포커스·한글 레이블 | SC-008 |

## 게이트 (병합 전)

- [ ] `uniqueTitle`·`moveDocument` Vitest 통과(헌법 IV)
- [ ] 기존 110 회귀 0(SC-007)
- [ ] 플러그인·파이프라인·sanitize 무변경(헌법 I·II)
- [ ] 대시보드·셀렉터 anti-slop·한글 aria(헌법 V·FR-012)

상세: [routing](./contracts/routing.md) · [dashboard](./contracts/dashboard.md) · [folder-select](./contracts/folder-select.md).
