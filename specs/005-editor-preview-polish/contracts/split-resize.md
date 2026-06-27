# Contract: 에디터:프리뷰 경계 리사이즈

## 구조 (EditorScreen 컨텐츠 Panel 내부)

```text
(외곽) Group[사이드바 | 컨텐츠]
        └ 컨텐츠 Panel
            └ Toolbar / TableActions
            └ (신규) Group[에디터 | 프리뷰]  ← 중첩 가로 Group
                ├ Panel(에디터, defaultSize "50%", minSize "25%")
                ├ Separator(md-resize-handle, aria-label="에디터·프리뷰 크기 조절")
                └ Panel(프리뷰, groupResizeBehavior preserve-relative-size, minSize "25%")
```

## 계약 규칙

| # | 규칙 | 검증 |
|---|------|------|
| L1 | 경계 드래그 → 에디터·프리뷰 너비 비율 변경(FR-001) | 수동/시각 |
| L2 | 각 Panel minSize로 한쪽 과축소 방지(FR-002) | 최소 한계 멈춤 |
| L3 | 비율 변경 후 실시간 렌더·입력 정상(FR-003·009) | 회귀 |
| L4 | 핸들 한글 aria-label + 키보드 조작(FR-010·SC-007) | aria/키보드 |
| L5 | 핸들 anti-slop(md-resize-handle 재사용, 그라데이션·글로우 없음) | 시각 |

기존 PanelLabel(MARKDOWN/미리보기 도트)은 각 Panel 내부에 유지.
