# TDD-IMPLEMENTS — 구현 진행 추적 (M1)

> 마일스톤별 테스트 파일·상태 기록(TRD §7). 기대값 출처: `docs/markdown-editor-spec.md`.

## M1 — 단일 화면 마크다운 에디터

**스택**: Next.js 16.2.9 · React 19.2.7 · TypeScript 5 · Tailwind 4 · CodeMirror 6 ·
unified(remark/rehype) · Zustand · Vitest 4.

**상태**: GREEN — 44/44 테스트 통과, 프로덕션 빌드 성공.

| 영역 | 테스트 파일 | 검증 계약 | 상태 |
|------|------------|----------|------|
| 파이프라인 코어 | `tests/conformance/markdown/core.test.ts` | P2 (CommonMark) | ✅ GREEN |
| 파이프라인 GFM | `tests/conformance/markdown/gfm.test.ts` | P3 (표·취소선·작업목록·자동링크) | ✅ GREEN |
| Sanitize | `tests/conformance/markdown/sanitize.test.ts` | P4·SC-005 (XSS 차단) | ✅ GREEN |
| 헬퍼 | `tests/unit/plugins/helpers.test.ts` | C2·C3·C4 | ✅ GREEN |
| 플러그인 | `tests/unit/plugins/plugins.test.ts` | C1·C5·C6 (19종 레지스트리) | ✅ GREEN |
| 스토리지 | `tests/unit/storage/local.test.ts` | S1–S6 | ✅ GREEN |
| 카운트 | `tests/unit/status/count.test.ts` | FR-016 | ✅ GREEN |

## 실행

```bash
npm test          # vitest run — 전체
npm run build     # next build — 타입체크 + 정적 빌드
npm run dev       # 개발 서버
```

## 잔여 (수동 검증 필요 — 미완)

- T039 성능: 1만 자 문서 입력 지연 무체감(SC-002) — 런타임 측정 필요
- T040 디자인 일치: `docs/design/project/Markdown Editor.dc.html` 픽셀 매칭(SC-008) — 시각 비교 필요
- T041 quickstart V1–V12 수동 검증 — 자동 테스트가 V1~V10 로직 커버, 브라우저 E2E 미실행
- T044–T046 (Phase 8 잔여·선택): 리사이즈·계약 문서 보강·스크롤 동기화 — 의도적 후속

---

## M2 — 전체 마크다운 툴바

**상태**: GREEN — 76/76 테스트 통과(M1 44 + M2 32), 빌드 성공. 신규 의존성 0.

| 영역 | 테스트 파일 | 검증 | 상태 |
|------|------------|------|------|
| 계약 진화 | `tests/unit/plugins/contract-v2.test.ts` | V1–V3(다중필드 inputs) | ✅ |
| 헬퍼 v2 | `tests/unit/plugins/helpers-v2.test.ts` | insertAtLineEnd·appendReferenceDef | ✅ |
| 신규 태그 | `tests/unit/plugins/new-tags.test.ts` | ***·autolink(빈선택 C1)·hardBreak·setext | ✅ |
| 참조 링크 | `tests/unit/plugins/reference-link.test.ts` | R1–R6(중복 재사용) | ✅ |
| 활성표시 | `tests/unit/plugins/active-ids.test.ts` | V4·V5 + C2 성능(<50ms) | ✅ |
| 코드 언어 | `tests/unit/plugins/code-lang.test.ts` | FR-008 | ✅ |
| 표 편집 | `tests/unit/markdown/table-ops.test.ts` | T1–T6 불변식 | ✅ |
| 커버리지 | `tests/unit/plugins/toolbar-coverage.test.ts` | SC-001 전 태그 감사(C3) | ✅ |

**신규**: 플러그인 24종(M1 19+5), `apply` 다중필드 계약, `Dialog`(다중필드), 활성표시 인프라
(`computeActiveIds`+store activeIds+Toolbar), `tableOps`(순수, lib), `TableActions`(컨텍스트 바).

**수동 검증 미완**: T030 quickstart W1–W15 브라우저 E2E(`npm run dev`).

---

## M2 — 레이아웃(사이드바 + 리사이즈)  ※ requirement.md §12 기준 M2

**상태**: GREEN — 91/91 테스트 통과(+Sidebar 3), 빌드 성공. `react-resizable-panels` 4.11.2 추가.

| 영역 | 테스트/검증 | 상태 |
|------|------------|------|
| Sidebar 렌더 | `tests/unit/components/sidebar.test.tsx`(aria·[+]·빈상태) | ✅ |
| 레이아웃 재구성 | EditorScreen `Group/Panel/Separator`(사이드바\|컨텐츠) | ✅ |
| 리사이즈 | Panel `defaultSize 260px / minSize 180px / maxSize 480px` | ✅ |
| 회귀 | 기존 88 전부 통과(SC-003) | ✅ |

**신규**: `Sidebar.tsx`(셸: [+] 폴더생성 자리 M3 비활성 + 빈상태 안내), EditorScreen 3분할 재배치,
리사이즈 핸들 스타일(1px 중성→hover 액센트, anti-slop).

**범위 밖(M3)**: 폴더/문서 데이터·CRUD·다중문서·IndexedDB. **수동 미검증**: T009 `npm run dev`로 드래그 리사이즈 시각 확인.
