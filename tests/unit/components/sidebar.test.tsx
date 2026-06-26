import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Sidebar } from "@/components/editor/Sidebar";

afterEach(cleanup);

describe("Sidebar (M2 레이아웃 셸)", () => {
  it("탐색기 영역과 한글 aria 레이블 렌더", () => {
    render(<Sidebar />);
    expect(screen.getByLabelText("문서 탐색기")).toBeTruthy();
  });

  it("[+] 폴더 생성 버튼 자리 (M2 비활성, M3 제공)", () => {
    render(<Sidebar />);
    const btn = screen.getByLabelText("폴더 생성") as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.disabled).toBe(true);
  });

  it("빈 상태 안내(M3 예고) 표시", () => {
    render(<Sidebar />);
    expect(screen.getByText(/다음 단계에서 제공/)).toBeTruthy();
  });
});
