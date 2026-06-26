# Quickstart & Validation: 전체 마크다운 툴바 (M2)

M1 위에 추가되는 M2 기능을 end-to-end로 검증하는 가이드. 구현 코드는 tasks.md에서.

## 전제

M1 구현·빌드 완료 상태(`specs/001-single-screen-editor`). 신규 런타임 의존성 없음.

## 실행

```bash
npm run dev        # 개발 서버
npm test           # Vitest 전체(M1 + M2)
npx vitest run tests/unit/plugins      # 신규 플러그인
npx vitest run tests/unit/markdown     # tableOps · referenceLink
npm run build      # 빌드 검증
```

## 검증 시나리오 (spec 수용 기준 → 자동·수동)

| # | 시나리오 | 조작 | 기대 | 출처 |
|---|---------|------|------|------|
| W1 | 굵은 기울임 | "강조" 선택 → 버튼 | `***강조***`, 재클릭 해제 | US1, V1 |
| W2 | 참조 링크 | 선택 → id·url 입력 | 본문 `[t][id]` + 하단 `[id]: url` 1건 | SC-003, R1·R2 |
| W3 | 참조 링크 중복 id | 같은 id 재사용 | 정의 추가 안 됨 | R3 |
| W4 | 자동 링크 | URL 선택 → 버튼 | `<URL>` | US1 |
| W5 | 강제 줄바꿈 | 줄 끝 → 버튼 | `\` 삽입, 프리뷰 줄바꿈 | US1 |
| W6 | Setext 제목 | 줄에 커서 → 버튼 | 아래 줄 `===`/`---`, 제목 렌더 | US1 |
| W7 | 활성 표시 | `**굵게**` 안에 커서 | 굵게 버튼 활성 표시 | SC-002, V4 |
| W8 | 활성 해제 | 평문으로 커서 이동 | 활성 표시 해제 | V5 |
| W9 | 코드 언어 | 코드블록 → "python" | ` ```python `, 프리뷰 언어 클래스 | SC-004 |
| W10 | 표 행 추가 | 표 안 → 행 추가 | 빈 셀 새 행 | SC-005, T2 |
| W11 | 표 열 추가 | 표 안 → 열 추가 | 전 행 +1셀, 구분선 확장 | T3 |
| W12 | 표 정렬 | 열 → 가운데 | 구분선 `:---:`, 중앙 렌더 | T4 |
| W13 | 표 밖 액션 | 표 밖 → 행/열 버튼 | no-op·비활성 | T5 |
| W14 | 격리 검증 | 신규 태그 추가 경로 | 파서·CM어댑터 무수정 | SC-006, V6 |
| W15 | 접근성 | 키보드 Tab + aria | 신규 버튼 포커스·한글 레이블 | SC-007 |

## 게이트 (병합 전)

- [ ] 신규 태그 = 파일1 + index.ts 1줄, 파서·CM 어댑터 무수정(헌법 I·FR-012)
- [ ] 플러그인·tableOps·referenceLink Vitest 통과(헌법 IV)
- [ ] 활성표시가 선택 변경에 즉시 반응(SC-002)
- [ ] 신규 UI anti-slop 자가 점검(헌법 V) — M1 토큰 재사용
- [ ] 렌더 파이프라인·sanitize 무변경(헌법 II)

상세: [plugin-contract-v2](./contracts/plugin-contract-v2.md) · [table-ops](./contracts/table-ops.md) · [reference-link](./contracts/reference-link.md). 데이터: [data-model](./data-model.md).
