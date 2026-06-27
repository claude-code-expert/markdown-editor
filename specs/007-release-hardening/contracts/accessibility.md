# Contract: 접근성 (US2 / FR-004~007)

UI 접근성 계약. 위반 0건이 수용 기준(SC-003·004·005).

## A1 — 키보드 도달(FR-004)

모든 인터랙티브 요소는 Tab/Shift+Tab 순회로 포커스 가능하고 보이는 포커스 표시를 가진다.

| 요소 | 위치 | 현 상태(감사) |
|------|------|----------------|
| 툴바 버튼 | `Toolbar.tsx:47` | ✅ `aria-label={plugin.label}` + focus ring |
| 트리 항목/액션 | `FolderTree.tsx:70,84,89,100,132,140,151` | ✅ 라벨 + ring |
| 리사이즈 핸들 ×2 | `EditorScreen.tsx:112,143` | ✅ `Separator` tabIndex + aria-label |
| 폴더 선택 | `FolderSelect.tsx:34` | ✅ `aria-label="저장 폴더 선택"` |
| 대시보드 링크 | `EditorScreen.tsx:84` | ✅ `aria-label="대시보드로"` + ring |
| 대시보드 항목 | `Dashboard.tsx:92` | ✅ `aria-label` |
| 저장/취소 | `StatusBar.tsx:46,62` | ✅ 가시 텍스트=접근명 + ring |

**계약**: 위 표 모든 행이 포커스+실행 가능. 신규 컨트롤 추가 시 이 표에 등재.

## A2 — 한글 접근성 이름(FR-005)

모든 인터랙티브 요소는 한글 `aria-label` 또는 한글 가시 텍스트를 접근명으로 가진다. 누락 0건(SC-004).

## A3 — 키보드 리사이즈(FR-006)

영역 경계는 화살표 키로 조절되고 한계에서 멈춘다. **증분은 라이브러리(react-resizable-panels 4.11)
기본값을 측정·확정**(M7 R1):

| 키 | 동작(수평 Group) | 출처 |
|----|------------------|------|
| `ArrowLeft`/`ArrowRight` | 경계를 **±5%p**씩 이동 | dist `B(t, ±5)` |
| `Home`/`End` | 최소/최대(±100%, 한계까지) | dist `B(t, ∓100)` |

- **Given** 핸들에 포커스, **When** `ArrowRight` 1회, **Then** 패널이 5%p 커진다.
- **Given** 사이드바 폭 = 180px(하한, `minSize`), **When** 축소 방향, **Then** 더 줄지 않음(클램프).
- **Given** 사이드바 폭 = 480px(상한, `maxSize`), **When** 확대 방향, **Then** 더 늘지 않음.
- `Separator`는 `aria-valuenow`/`valuemin`/`valuemax`를 노출(스크린리더 현재 비율 전달).
- 5%p 증분·Home/End는 `minSize`/`maxSize` 범위 안에서 클램프되므로 FR-006 "정해진 증분·한계 정지"
  를 충족한다(수동 확인 = quickstart M3·M4).

## A4 — 색 대비(FR-007, SC-005)

텍스트로 쓰이는 모든 색 토큰은 배경 대비 WCAG AA 이상.

| 토큰쌍 | 용도 | 기준 | 판정 |
|--------|------|------|------|
| `--fg` on `--bg` | 본문 | ≥4.5:1 | ✅ ~14:1 |
| `--fg-muted` on `--bg` | 보조 | ≥4.5:1 | ✅ ~7.4:1 |
| `--fg-faint` on `--bg` | 상태/카운트/라벨 | ≥4.5:1 | ❌ ~2.6:1 → **상향 필요** |
| `--accent-fg` on `--accent` | 저장 버튼 | ≥4.5:1 | ✅ |
| `--ok` 점 인디케이터 | aria-hidden 장식 | 면제(텍스트 아님) | ✅ |

**계약**: `contrast.test.ts`가 "텍스트 토큰쌍 4.5:1↑"을 단언. 장식(aria-hidden)은 제외.
`--fg-faint` 상향 후 8개 사용처(StatusBar 카운트, PanelLabel, FolderTree 힌트)가 자동 충족.
