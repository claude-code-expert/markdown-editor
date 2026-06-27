import { describe, it, expect, vi } from "vitest";
import { mayDiscard, DISCARD_MESSAGE } from "@/lib/util/dirtyGuard";

/**
 * 미저장 이탈 가드(FR-008·SC-006) — 대시보드 이동 등 클라이언트 네비의 dirty 보호 판정.
 * 3경로(beforeunload·문서전환·대시보드) 공통 결정 로직.
 */
describe("mayDiscard", () => {
  it("dirty 아니면 confirm 없이 통과", () => {
    const confirm = vi.fn(() => false);
    expect(mayDiscard(false, confirm)).toBe(true);
    expect(confirm).not.toHaveBeenCalled();
  });

  it("dirty + 사용자 확인(버림) → 통과", () => {
    expect(mayDiscard(true, () => true)).toBe(true);
  });

  it("dirty + 사용자 취소 → 차단", () => {
    expect(mayDiscard(true, () => false)).toBe(false);
  });

  it("dirty일 때만 confirm 호출", () => {
    const confirm = vi.fn(() => true);
    mayDiscard(true, confirm);
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it("경고 문구는 한글", () => {
    expect(DISCARD_MESSAGE).toContain("저장하지 않은 변경");
  });
});
