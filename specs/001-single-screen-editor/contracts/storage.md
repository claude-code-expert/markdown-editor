# Contract: 로컬 영속 (M1 — localStorage)

## 시그니처

```typescript
// src/lib/storage/local.ts
export interface StoredDoc { content: string; updatedAt: number; }

export function loadDoc(): { content: string; isSeed: boolean };
export function saveDoc(content: string): { ok: true } | { ok: false; error: string };
```

- 키: `mdeditor:v1`. 값: `JSON.stringify(StoredDoc)`.

## 계약 규칙 (테스트 가능)

| # | 규칙 | 검증 |
|---|------|------|
| S1 | 키 부재 시 `loadDoc` → seed 콘텐츠 + `isSeed:true`(FR-018) | 빈 storage mock |
| S2 | 키 존재 시(빈 문자열 포함) → 저장본 우선, `isSeed:false`(FR-013) | 저장본 mock |
| S3 | JSON 파싱 실패 시 → seed로 안전 복구, 앱 비크래시(엣지) | 손상 값 mock |
| S4 | `saveDoc` 성공 → `{ok:true}`, `updatedAt` 갱신 | round-trip 단언 |
| S5 | `saveDoc` quota/쓰기 실패 → `{ok:false,error}`, 호출측 토스트(FR-012) | quota 예외 mock |
| S6 | 저장 후 재로드 → content 100% 동일(SC-004) | save→load 단언 |

## 책임 경계

- `local.ts`는 직렬화·복구만. dirty/취소/beforeunload 흐름은 `useEditorStore`(data-model.md).
- 시드 원본은 `src/lib/constants/seed.ts`. 스토리지는 seed를 "키 부재" 시에만 반환.
- M3에서 IndexedDB(`idb`)로 이관 — 동일 `loadDoc/saveDoc` 추상 뒤에서 교체(호출측 무변경 목표).
