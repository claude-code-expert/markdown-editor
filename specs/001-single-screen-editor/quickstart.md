# Quickstart & Validation: 단일 화면 마크다운 에디터 (M1)

end-to-end로 M1이 동작함을 증명하는 실행·검증 가이드. 구현 코드는 담지 않는다(→ tasks.md).

## 전제 / 스캐폴딩

```bash
# 그린필드 — 최초 1회
npx create-next-app@latest . --ts --tailwind --app --src-dir
npm i codemirror @codemirror/state @codemirror/view @codemirror/commands \
      unified remark-parse remark-gfm remark-rehype rehype-sanitize rehype-stringify \
      lucide-react zustand react-resizable-panels
npm i -D vitest @testing-library/react jsdom
# 정확 버전은 구현 시점 `npm show <pkg> version`으로 고정(헌법·TRD §1)
# jsconfig.json 잔재 있으면 삭제(tsconfig.json 사용)
```

## 실행

```bash
npm run dev        # 개발 서버(Turbopack) → http://localhost:3000
npm run build      # Vercel 배포 검증(NFR-6)
npm test           # Vitest 전체
npx vitest run tests/unit/plugins        # 플러그인 단위
npx vitest run tests/conformance/markdown # 렌더 conformance
```

## 검증 시나리오 (spec 수용 기준 → 수동·자동)

| # | 시나리오 | 조작 | 기대 | 출처 |
|---|---------|------|------|------|
| V1 | 실시간 렌더 | `# 제목` 입력 후 정지 | ≤150ms 내 프리뷰에 H1 | SC-001, US1 |
| V2 | GFM 표/체크박스 | 표·`- [x]` 입력 | 표 행·열, 체크박스 렌더 | P3, US1 |
| V3 | XSS 방어 | `<script>alert(1)</script>` 입력 | 스크립트 미실행·제거 | SC-005, P4 |
| V4 | 굵게 토글 | "안녕" 선택 후 B(또는 Mod-b) | `**안녕**`, 재적용 시 해제 | US2, C3 |
| V5 | 링크 다이얼로그 | 텍스트 선택 후 링크 버튼 → URL 입력 | `[텍스트](url)` 삽입 | US2, C5 |
| V6 | 저장/복원 | 작성 → 저장 → 새로고침 | 마지막 저장본 자동 로드 | SC-004, US3 |
| V7 | 취소 | 저장 후 수정 → 취소 | 마지막 저장 상태 복원 | US3, FR-014 |
| V8 | 이탈 경고 | 미저장 변경 후 탭 닫기 | 경고 표시 | FR-015 |
| V9 | 첫 방문 시드 | storage 비우고 진입 | 온보딩 샘플 표시(빈 화면 아님) | FR-018 |
| V10 | 상태바 | 입력 증감 | 문자수·줄수 즉시 갱신 | FR-016 |
| V11 | 접근성 | 키보드 Tab 순회 | 모든 버튼 포커스·한글 aria-label | SC-007, NFR-3 |
| V12 | 디자인 일치 | 화면 비교 | 디자인 레퍼런스와 시각 일치, anti-slop 준수 | SC-008 |

## 게이트 (병합 전)

- [ ] 파이프라인에 `rehype-sanitize` 존재(헌법 II) — V3 통과
- [ ] 신규 플러그인 = 파일1개 + index.ts 1줄, 코어 무수정(헌법 I)
- [ ] 플러그인 `apply`/`isActive` Vitest 통과(헌법 IV) — V4 등
- [ ] conformance 기대값 = `markdown-editor-spec.md`
- [ ] UI anti-ai-slop 자가 점검 통과(헌법 V) — V12

상세 계약: [markdown-plugin](./contracts/markdown-plugin.md) · [pipeline](./contracts/markdown-pipeline.md) · [storage](./contracts/storage.md). 데이터: [data-model](./data-model.md).
