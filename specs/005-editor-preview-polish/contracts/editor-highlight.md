# Contract: 에디터 마크다운 구문 강조 (`MarkdownEditor.tsx`)

## 변경

CM `extensions` 배열에 `markdown()`(`@codemirror/lang-markdown`) 추가. basicSetup·lineWrapping·
keymap·updateListener·theme와 공존.

```text
extensions: [ basicSetup, markdown(), EditorView.lineWrapping, shortcutKeymap, keymap.of(defaultKeymap),
              updateListener, theme ]
```

## 계약 규칙

| # | 규칙 | 검증 |
|---|------|------|
| H1 | 제목·강조·코드·링크·목록 등 마크다운 문법이 평문과 구분되는 스타일로 강조(FR-007) | 시각 |
| H2 | 한글 입력·대용량 문서에서 입력 지연 무체감(FR-008·SC-005) | 성능/수동 |
| H3 | 구문 강조는 에디터 표시 전용 — 렌더 파이프라인·플러그인 무관(헌법 I·II) | 회귀 |
| H4 | 기존 단축키·활성표시·IME·디바운스 렌더와 충돌 없음(SC-006) | 회귀 |

## 비고

- 코드 블록 내부 언어별 하이라이트·수식(KaTeX)은 본 마일스톤 범위 밖(선택).
- lang-markdown은 CM 점진 파싱이라 IME·대용량에 안정.
