# Phase 1 Data Model: 전체 마크다운 툴바 (M2)

M2는 새 영속 엔티티를 도입하지 않는다(단일 문서·localStorage 계승). 런타임 모델과 마크다운 텍스트
내부 구조만 확장한다.

## 런타임 상태 확장 (Zustand `useEditorStore`)

| 필드 | 타입 | 설명 | 비고 |
|------|------|------|------|
| `doc` `savedDoc` `dirty` | (M1) | 계승 | 변경 없음 |
| `activeIds` | string[] | 현재 커서/선택에서 활성인 플러그인 id 집합 | 신규(FR-006·007) |
| `setActiveIds(ids)` | action | 선택 변경 시 갱신 | MarkdownEditor가 호출 |

## 플러그인 계약 확장 (런타임, 비영속)

| 타입 | M1 | M2 변경 |
|------|----|--------|
| `MarkdownPlugin.apply` | `(state, input?: string)` | `(state, inputs?: Record<string,string>)` |
| `MarkdownPlugin.dialog` | — | `{ fields: { key; label; placeholder?; optional? }[] }`(신규, 선택) |
| `requiresInput` | boolean | `dialog` 존재로 대체(호환 위해 유지 가능) |
| `isActive` | (state)→bool | 변경 없음 — 활성표시에 그대로 사용 |

## 마크다운 텍스트 내부 구조 (영속 doc 내부)

### 참조 링크 정의 (Reference Definition)

- 본문: `[표시텍스트][식별자]`
- 문서 하단 수집: `[식별자]: URL` (한 줄당 1정의)
- 규칙: 동일 식별자 정의 중복 금지(존재 시 재사용). 정의 블록은 문서 끝, 본문과 빈 줄 1개로 분리.

```text
... 본문 ...
[텍스트][ref1] ...

[ref1]: https://example.com
[ref2]: https://other.com
```

### 표 블록 (Table) — tableOps 조작 대상

```text
| 헤더1 | 헤더2 |      ← 헤더 행
| :--- | ---: |       ← 구분선 행(정렬: 좌/우/가운데 :---:)
| a | b |             ← 바디 행(0..n)
```

- 불변식: 모든 행의 셀 수 = 헤더 셀 수 = 구분선 셀 수. addColumn/addRow는 이 정합성 유지.
- 정렬: 구분선 셀을 `---`(기본)·`:---`(좌)·`:---:`(가운데)·`---:`(우)로 치환.

## 활성 표시 상태 전이

```text
selection 변경(CM updateListener)
  → EditorState 추출(doc, from, to)
  → PLUGINS.filter(p => p.isActive?.(state)).map(id)
  → store.setActiveIds(ids)
  → Toolbar: activeIds 포함 버튼에 활성 스타일
```

M3 이관 노트: 없음(M2는 저장 모델 무변경).
