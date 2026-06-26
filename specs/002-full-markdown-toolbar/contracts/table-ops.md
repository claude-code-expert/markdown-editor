# Contract: 표 편집 순수 연산 (`src/lib/markdown/tableOps.ts`)

프레임워크 비종속 순수 함수. 커서가 속한 GFM 표 블록을 파싱·조작·재직렬화한다.

## 시그니처

```typescript
export type Align = "none" | "left" | "center" | "right";

export function isInTable(doc: string, pos: number): boolean;
export function addRow(doc: string, pos: number): EditorChange;
export function addColumn(doc: string, pos: number): EditorChange;
export function setColumnAlign(doc: string, pos: number, colIndex: number, align: Align): EditorChange;
```

## 계약 규칙 (테스트 가능)

| # | 규칙 | 검증 |
|---|------|------|
| T1 | `isInTable`: 커서가 헤더+구분선+바디로 구성된 표 블록 내부면 true | 표 안/밖 |
| T2 | `addRow`: 헤더 셀 수와 동일한 빈 셀 행을 표 끝에 추가 | 셀 수 일치 |
| T3 | `addColumn`: 헤더·구분선·모든 바디 행에 셀 1개씩 추가(정합성 유지) | 전 행 +1 |
| T4 | `setColumnAlign`: 해당 열 구분선을 `:---`/`:---:`/`---:`/`---`로 치환 | GFM 정렬 문법 |
| T5 | 표 밖에서 호출 시 no-op(doc 불변) | 오삽입 방지(엣지) |
| T6 | 조작 후에도 모든 행 셀 수 == 헤더 셀 수(불변식) | 파싱 깨짐 0(SC-005) |

## 책임 경계

- `tableOps`는 텍스트 변환만. 버튼 활성/비활성(표 안일 때만)은 Toolbar가 `isInTable`로 판정.
- 표 삽입(빈 표)은 M1 `table` 플러그인 유지. 본 계약은 **편집**만 담당.
- 기대 GFM 출력 검증값 출처: `docs/markdown-editor-spec.md §7.2`.
