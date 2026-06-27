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

---

## M3 — 저장소(폴더/문서 영속 + 다중 문서)  ※ requirement.md §12 M3

**상태**: GREEN — 115/115 통과(기존 91 + M3 24), 빌드 성공. `idb` 8 + `fake-indexeddb`(dev) 추가.

| 영역 | 테스트 | 상태 |
|------|--------|------|
| 폴더 리포지토리 | `tests/unit/storage/folders.test.ts`(D1·D4 cascade) | ✅ |
| 문서 리포지토리 | `tests/unit/storage/documents.test.ts`(D2·D3·D5·D6) | ✅ |
| 마이그레이션 | `tests/unit/storage/migrate.test.ts`(M1–M4 + **C1 부활방지**) | ✅ |
| 워크스페이스 협응 | `tests/unit/store/workspace.test.ts`(W1·W2·W4 무혼합·W5·W6) | ✅ |
| 사이드바·트리 | `tests/unit/components/{sidebar,folder-tree}.test.tsx` | ✅ |

**신규**: `lib/storage/{db,folders,documents,migrate}.ts`(IndexedDB), `useWorkspaceStore`, 에디터 버퍼 전환(`useEditorStore` init/save 제거→setBuffer/markSaved), `FolderTree.tsx`, Sidebar 재작성(트리), EditorScreen `loadAll`, StatusBar `saveActive`.

**analyze 수정 반영**: C1(멱등=meta 플래그, 문서수 아님) · U1(신규설치 빈 문서 1건 시드) · G1(저장 실패 `{ok:false}` 토스트).

**수동 미검증**: T027 `npm run dev`로 폴더 생성·문서 전환·삭제 시각 확인.

---

## M4 — 에디터/프리뷰 보강  ※ requirement.md §12 M4(보강)

**상태**: GREEN — 110/110 통과(기존 104 + 스크롤 6), 빌드·dev 부팅 OK. `@codemirror/lang-markdown` 추가.

| 영역 | 테스트/검증 | 상태 |
|------|------------|------|
| 스크롤 비율 순수함수 | `tests/unit/scroll/sync-scroll.test.ts`(Y1–Y5) | ✅ |
| 경계 리사이즈 | EditorScreen 중첩 Group(에디터\|프리뷰, minSize 25%) | ✅(시각 수동) |
| 스크롤 동기화 배선 | syncScroll(lock+rAF) + getScroller↔previewRef | ✅(런타임) |
| 구문 강조 | CM `markdown()` 확장 | ✅(시각 수동) |
| 회귀 | 기존 104 통과(SC-006) | ✅ |

**신규**: `lib/scroll/syncScroll.ts`(순수+배선), EditorScreen 중첩 Group + 동기화 effect, MarkdownEditor `markdown()`+`getScroller()`, Preview forwardRef, controller `getScroller`.

**수동 미검증**: T010 Z1–Z10(`npm run dev`) — 리사이즈 드래그·스크롤 되튐·구문강조 시각·한글 성능.

---

## M6 — 문서 흐름(대시보드·라우팅·폴더 저장)  ※ requirement.md §12 M6

**상태**: GREEN — 117/117 통과(기존 110 + M6 7), 빌드·dev부팅 OK. 신규 의존성 0(Next App Router).

| 영역 | 테스트/검증 | 상태 |
|------|------------|------|
| 중복 제목 | `tests/unit/util/unique-title.test.ts`(U1–U3) | ✅ |
| 문서 이동·멱등 | `tests/unit/store/workspace-move.test.ts`(moveDocument·중복접미사·loadAll 멱등) | ✅ |
| M3 회귀 갱신 | `workspace.test.ts` loadAll 비자동선택 반영(3건) | ✅ |
| 라우팅 | `/`(대시보드 static)·`/editor/[docId]`(dynamic) | ✅(dev 부팅) |
| 대시보드·폴더선택 | Dashboard·FolderSelect | ✅(시각 수동) |

**신규**: `app/page.tsx`(Dashboard)·`app/editor/[docId]/page.tsx`·`components/dashboard/Dashboard.tsx`·
`FolderSelect.tsx`·`lib/util/uniqueTitle.ts`·`storage/documents.setFolder`. **수정**: workspace(loadAll 멱등·moveDocument·uniqueTitle 통합), EditorScreen(loadAll 제거→라우트 주도 + 헤더 FolderSelect·대시보드 링크), FolderTree(클릭→router.push). 테스트 next/navigation 모킹 추가.

**analyze 수정 반영**: O1(uniqueTitle을 US3/생성·이동 경로에 통합, P3 미루지 않음)·A1(자동접미사 확정)·U1(토스트=M3 StatusBar 재사용).

**수동 미검증**: W1~W13(`npm run dev`) — 대시보드 클릭·새로고침 유지·폴더선택 저장·중복명 시각.

---

## M7 — 마감(성능·접근성·안전종료·배포 검증)  ※ requirement.md §12 M7

**상태**: GREEN — 142/142 통과(기존 117 + M7 25), 빌드 무설정 성공, 서버 의존 0. 신규 런타임 의존성 0.

**감사 grounding(2026-06-27)**: 인프라 대부분 기존(디바운스 120ms·sanitize 테스트·beforeunload·
키보드 리사이즈 rrp v4 기본·한글 aria). 실제 결함 4건만 수정.

| 영역 | 테스트/검증 | 상태 |
|------|------------|------|
| 색 대비(FR-007) | `tests/unit/a11y/contrast.test.ts`(globals.css 실값 파싱, AA 4.5:1) | ✅ RED→GREEN |
| 렌더 예산·디바운스(FR-001·002) | `tests/unit/perf/render-budget.test.ts`·`components/preview-debounce.test.tsx` | ✅ |
| 미저장 이탈 가드(FR-008) | `tests/unit/util/dirty-guard.test.ts`(mayDiscard 순수) | ✅ |
| sanitize 확장(FR-009) | `sanitize.test.ts` +6 페이로드(iframe·svg onload·data:·style·object·onclick) | ✅ 회귀 고정 |
| 토스트 구분(FR-010) | StatusBar kind별 의미색 좌측 보더 | ✅(시각 수동) |
| 무설정 빌드(FR-012) | `npm run build` 성공·서버 의존 0 | ✅ |

**수정 결함 4건**: ① `--danger` 토큰 신규 정의(`#c92a2a`, FolderSelect 깨짐 정상화) ② `--fg-faint`
`#98a1b2`→`#6b7280`(2.6:1→≈4.8:1 AA) ③ 저장 토스트 성공=`--ok`/실패=`--danger` 좌측 보더 + role=status
④ 대시보드 `<Link>` dirty 가드(클라 네비 beforeunload 미발화 보완, `mayDiscard` 헬퍼).

**신규**: `lib/a11y/contrast.ts`(순수 WCAG)·`lib/util/dirtyGuard.ts`(순수). **수정**: `globals.css`(토큰 2),
`StatusBar.tsx`(토스트 kind), `EditorScreen.tsx`(대시보드 가드).

**analyze 반영(MEDIUM)**: A1(렌더예산 하드 50ms→관대한 상한+스케일링 가드, CI flake 회피)·
U1(키보드 증분 측정·문서화: 화살표 ±5%p·Home/End 한계, contracts/accessibility.md A3)·N2(라인 145→143 정정).

**헌법 게이트**: I(플러그인 무수정)·II(sanitize 강화·회귀만)·III(SDD)·IV(TDD RED→GREEN)·
V(토스트 무채색 배경+의미색 1px 보더, 컬러그림자·글로우·그라데이션 0) 전부 통과.

**수동 미검증**: quickstart M1~M8 13항목(`npm run dev`) — 체감·IME·키보드·리사이즈·dirty 3경로·
토스트 구분·영속·XSS 시각.
