# Data Model: M7 마감

**신규 데이터 모델 없음.**

M7은 비기능 마감(성능·접근성·안전종료·배포) 마일스톤으로 영속 엔티티를 추가/변경하지 않는다.
기존 M3/M6 모델을 **그대로 재사용**한다.

## 재사용 엔티티(변경 없음)

| 엔티티 | 스토어 | 비고 |
|--------|--------|------|
| `Folder` | IndexedDB `folders` | M3 정의. M7 무수정 |
| `Document` | IndexedDB `documents`(`folderId→folders.id` 1:N) | M3/M6 정의. M7 무수정 |
| 에디터 버퍼 | `useEditorStore`(doc/savedDoc/dirty/activeIds/inTable/initialized) | M7은 `dirty`를 **읽기만**(이탈 가드). 스키마 변경 없음 |

## M7이 건드리는 비영속 상태

- **토스트 메시지**(`StatusBar` 로컬 `useState`) — 성공/실패 구분 표시만 추가. 영속 아님.
- **디자인 토큰**(`globals.css` CSS 변수) — `--danger` 추가, `--fg-faint` 값 상향. 데이터 아님.

→ 마이그레이션·스키마 버전 변화 없음. 영속 데이터 무결성 리스크 0.
