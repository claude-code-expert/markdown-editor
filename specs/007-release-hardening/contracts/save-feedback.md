# Contract: 안전 종료·저장 피드백 (US3 / FR-008~011)

## S1 — 미저장 이탈 가드(FR-008, SC-006)

dirty 상태에서 이탈 3경로 모두 손실 경고. 취소 시 현재 상태 유지.

| 경로 | 메커니즘 | 현 상태 |
|------|----------|---------|
| 새로고침/탭닫기 | `beforeunload`(`EditorScreen.tsx:42`) | ✅ |
| 문서 전환(트리) | `window.confirm`(`FolderTree.tsx:38`) | ✅ |
| 대시보드 이동(링크) | 클라 네비 → **가드 추가 필요** | ❌ 갭(R4) |

**계약**: 세 경로 모두 dirty면 경고, 취소 시 유실 0. 대시보드 링크에 `onClick` confirm 가드 추가.

## S2 — Sanitize 항상(FR-009, SC-007) — 헌법 II NON-NEGOTIABLE

프리뷰는 원시 HTML의 스크립트·이벤트 핸들러·위험 프로토콜을 제거해 실행 차단.

- 파이프라인: `remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify`
  (`pipeline.ts:38`). **rehype-sanitize 제거·우회 시 병합 불가**.
- 기존 테스트: `sanitize.test.ts`(script·onerror·javascript:·정상보존 4케이스).
- **계약**: 알려진 XSS 페이로드 실행 0건. M7에서 페이로드 셋 확장(`<iframe>`·`<svg onload>`·
  `data:` 등) 회귀 고정.

## S3 — 저장 토스트 구분(FR-010)

성공/실패가 시각적으로 구분.

- 현재: 둘 다 `#1c2434` 동일 배경 → 구분 없음(갭).
- **처방(헌법 V 준수)**: 무채색 배경 유지 + 상태별 **좌측 `border-left: 3px solid`** + 의미색
  텍스트/아이콘. 성공=`--ok`, 실패=`--danger`(신규). 컬러 그림자·글로우·그라데이션 금지.
- 접근성: 실패 토스트는 `role="status"`(또는 `aria-live="assertive"` 검토). 현 `aria-live="polite"`.
- **계약**: 성공·실패 토스트가 서로 다른 시각 신호. `--danger` 토큰 정의(`FolderSelect.tsx:21`
  미정의 참조도 함께 정상화).

## S4 — 영속(FR-011)

저장 후 새로고침·재방문 시 폴더·문서·내용 보존(IndexedDB, M3/M6). M7 검증만.

- **계약**: quickstart 수동(저장→새로고침→동일 내용) + 기존 storage 단위 테스트 유지.
