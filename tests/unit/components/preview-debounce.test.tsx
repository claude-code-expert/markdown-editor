import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { createRef } from "react";

/**
 * 프리뷰 디바운스(FR-001·SC-002) — 입력 중 매 글자 재렌더 금지, 멈춘 뒤 ≤150ms 1회.
 * renderMarkdown을 spy로 감싸 호출 횟수를 센다(contracts/performance.md P1).
 */

const renderSpy = vi.fn((md: string) => `<p>${md.length}</p>`);
vi.mock("@/lib/markdown/pipeline", () => ({
  renderMarkdown: (md: string) => renderSpy(md),
}));

import { Preview } from "@/components/editor/Preview";
import { useEditorStore } from "@/lib/store/useEditorStore";

describe("Preview 디바운스", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    renderSpy.mockClear();
    useEditorStore.setState({ doc: "", savedDoc: "", dirty: false });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("연속 입력 N회 중에는 렌더가 0회다", () => {
    render(<Preview ref={createRef<HTMLDivElement>()} />);
    renderSpy.mockClear(); // 마운트 시 초기 타이머 무시

    act(() => {
      useEditorStore.getState().setDoc("a");
      useEditorStore.getState().setDoc("ab");
      useEditorStore.getState().setDoc("abc");
    });
    // 아직 디바운스 경과 전 — 렌더 0회
    expect(renderSpy).not.toHaveBeenCalled();
  });

  it("입력이 멎으면 디바운스 후 정확히 1회 렌더(최신값)", () => {
    render(<Preview ref={createRef<HTMLDivElement>()} />);
    renderSpy.mockClear();

    act(() => {
      useEditorStore.getState().setDoc("a");
      useEditorStore.getState().setDoc("ab");
      useEditorStore.getState().setDoc("abc");
    });
    act(() => {
      vi.advanceTimersByTime(120);
    });

    expect(renderSpy).toHaveBeenCalledTimes(1);
    expect(renderSpy).toHaveBeenLastCalledWith("abc");
  });

  it("디바운스 지연은 150ms 예산 내(120ms)에 발화한다", () => {
    render(<Preview ref={createRef<HTMLDivElement>()} />);
    renderSpy.mockClear();

    act(() => {
      useEditorStore.getState().setDoc("x");
    });
    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(renderSpy).toHaveBeenCalledTimes(1);
  });
});
