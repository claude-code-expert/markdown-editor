/**
 * 미저장 이탈 가드 — 순수 결정 함수(FR-008·save-feedback.md S1).
 * 네비게이션·새로고침·문서전환·대시보드 이동 등 "현재 버퍼를 떠나는" 모든 경로의 공통 판정.
 * 부수효과(confirm 다이얼로그)는 주입받아 테스트 가능하게 한다.
 *
 * @param dirty 저장하지 않은 변경 존재 여부
 * @param confirmDiscard dirty일 때만 호출되는 사용자 확인(버릴지 묻기). true=버리고 진행
 * @returns 네비게이션을 진행해도 되면 true
 */
export function mayDiscard(
  dirty: boolean,
  confirmDiscard: () => boolean,
): boolean {
  if (!dirty) return true;
  return confirmDiscard();
}

/** 미저장 이탈 경고 문구(문서 전환·대시보드 이동 공통). */
export const DISCARD_MESSAGE =
  "저장하지 않은 변경이 있습니다. 버리고 이동할까요?";
