# Contract: 마크다운 렌더 파이프라인 (헌법 원칙 II — NON-NEGOTIABLE)

## 시그니처

```typescript
// src/lib/markdown/pipeline.ts
export function renderMarkdown(md: string): string;   // → 정제된 안전 HTML 문자열
```

## 고정 파이프라인 (순서 불변)

```
입력(md)
  → remark-parse      CommonMark 0.31.2
  → remark-gfm        표·취소선·작업목록·자동링크 리터럴(GFM)
  → remark-rehype     mdast → hast
  → rehype-sanitize   XSS 방어 — 생략 불가
  → rehype-stringify  HTML
  → 출력(안전 HTML)
```

## 계약 규칙 (테스트 가능)

| # | 규칙 | 검증(conformance) |
|---|------|-------------------|
| P1 | `rehype-sanitize` 단계 제거·우회 불가(헌법 II) | 파이프라인 구성 정적 검사 + P4 |
| P2 | CommonMark 코어 19기능 HTML이 공식 출력과 일치 | `markdown-editor-spec.md` 기대값 단언 |
| P3 | GFM 4기능(표·취소선·작업목록·자동링크 리터럴) 렌더 | 기대값 단언, 코어/확장 구분 |
| P4 | 원시 `<script>`·`onerror`·`javascript:` 등 제거·무력화 | SC-005: 스크립트 0건 실행 |
| P5 | sanitize 스키마가 GFM 산출 허용(체크박스 `input[type=checkbox]`, 표 정렬) | 작업목록·표 비손상 단언 |
| P6 | 1만 자 입력에서 렌더 시간이 입력 흐름 차단 안 함 | SC-002 성능(디바운스와 병행) |

## Sanitize 스키마 노트

기본 GitHub 스키마 기반 + 보강:
- 허용: `input[type=checkbox][checked][disabled]`(작업목록), `th/td[align]` 또는 정렬 클래스(표),
  `a[href]`(자동링크), `code[class]`(언어 클래스).
- 차단(기본 유지): `script`, 이벤트 핸들러 속성(`on*`), `javascript:` URL, `style` 위험 속성.

기대값 출처: `docs/markdown-editor-spec.md` 각 기능 "HTML 결과물". 코어 ❘ GFM 분리 표기 준수.
