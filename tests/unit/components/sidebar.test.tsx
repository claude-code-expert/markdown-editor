import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Sidebar } from "@/components/editor/Sidebar";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";

beforeEach(() => {
  useWorkspaceStore.setState({
    folders: [],
    documents: [],
    activeDocId: null,
    expanded: new Set(),
  });
});
afterEach(cleanup);

describe("Sidebar (M3 — 폴더 트리)", () => {
  it("문서 탐색기 영역 + 한글 aria", () => {
    render(<Sidebar />);
    expect(screen.getByLabelText("문서 탐색기")).toBeTruthy();
  });

  it("[+] 폴더 생성 버튼 활성(M3)", () => {
    render(<Sidebar />);
    const btn = screen.getByLabelText("폴더 생성") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(false);
  });

  it("폴더 없을 때 빈 상태 안내", () => {
    render(<Sidebar />);
    expect(screen.getByText(/폴더가 없습니다/)).toBeTruthy();
  });
});
