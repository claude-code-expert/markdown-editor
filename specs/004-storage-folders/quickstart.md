# Quickstart & Validation: 저장소 — 폴더/문서 (M3)

## 전제 / 설치

```bash
npm i idb            # IndexedDB 래퍼
npm i -D fake-indexeddb   # 테스트용 IndexedDB
```

M2(사이드바 셸·리사이즈) 완료 상태 위에 얹는다.

## 실행

```bash
npm run dev
npm test                                  # 전체(기존 91 + M3)
npx vitest run tests/unit/storage         # 리포지토리·이관
npx vitest run tests/unit/store           # 워크스페이스 협응
npm run build
```

## 검증 시나리오 (spec 수용 기준 → 자동·수동)

| # | 시나리오 | 조작 | 기대 | 출처 |
|---|---------|------|------|------|
| X1 | 폴더 생성 | [+] → 이름 입력 | 트리에 폴더 추가 | SC-001, S1 |
| X2 | 문서 생성 | 폴더 "새 문서" | 폴더 아래 빈 문서 | FR-002, S2 |
| X3 | 문서 로드 | 트리 문서 클릭 | 에디터에 내용 로드(≤0.3초) | SC-002, W1 |
| X4 | 다중 문서 무혼합 | A 저장→B 저장→A | A 내용 정확 복원 | SC-005, W4 |
| X5 | 영속 | 폴더·문서 작성 후 새로고침 | 트리·내용 100% 보존 | SC-003, D7 |
| X6 | 이관 | 기존 mdeditor:v1 보유 상태 첫 실행 | "내 문서"에 그 내용 문서 1건 | SC-004, M1 |
| X7 | dirty 보호 | 미저장 변경 후 다른 문서 클릭 | 저장/버림/취소 확인 | FR-007, W3 |
| X8 | 이름변경 | 폴더/문서 이름변경 | 트리 반영·영속 | FR-010, S6 |
| X9 | 삭제 cascade | 문서 있는 폴더 삭제 | 확인 후 폴더+문서 제거 | FR-011, D4 |
| X10 | 회귀 | 에디터·툴바·프리뷰·활성표시·표편집 | 기존 동작 그대로(91 통과) | SC-006 |
| X11 | 접근성 | 트리 키보드 순회 | 노드·액션 포커스·한글 레이블 | SC-007, S8 |

## 게이트 (병합 전)

- [ ] 리포지토리·이관·워크스페이스 `fake-indexeddb` 단위 테스트 통과(헌법 IV)
- [ ] 기존 91 회귀 0(SC-006)
- [ ] 플러그인·파이프라인·sanitize 무변경(헌법 I·II)
- [ ] 사이드바 트리 anti-slop·한글 aria(헌법 V·FR-013)

상세: [storage-db](./contracts/storage-db.md) · [workspace-model](./contracts/workspace-model.md) · [sidebar-tree](./contracts/sidebar-tree.md). 데이터: [data-model](./data-model.md).
