import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { FolderTree } from "@/components/editor/FolderTree";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";

afterEach(cleanup);
beforeEach(() => {
  useWorkspaceStore.setState({
    folders: [],
    documents: [],
    activeDocId: null,
    expanded: new Set(),
  });
});

describe("FolderTree (S1–S3·S9)", () => {
  it("S9 폴더 0 → 빈 상태 안내", () => {
    render(<FolderTree />);
    expect(screen.getByText(/폴더가 없습니다/)).toBeTruthy();
  });

  it("S3 폴더>문서 트리 렌더(펼친 폴더)", () => {
    useWorkspaceStore.setState({
      folders: [{ id: "f1", name: "폴더A", parentId: null, createdAt: 1 }],
      documents: [{ id: "d1", folderId: "f1", title: "문서1", createdAt: 1, updatedAt: 1 }],
      activeDocId: "d1",
      expanded: new Set(["f1"]),
    });
    render(<FolderTree />);
    expect(screen.getByRole("tree", { name: "폴더 및 문서" })).toBeTruthy();
    expect(screen.getByText("폴더A")).toBeTruthy();
    expect(screen.getByText("문서1")).toBeTruthy();
  });

  it("S8 폴더/문서 액션 한글 aria", () => {
    useWorkspaceStore.setState({
      folders: [{ id: "f1", name: "폴더A", parentId: null, createdAt: 1 }],
      documents: [{ id: "d1", folderId: "f1", title: "문서1", createdAt: 1, updatedAt: 1 }],
      activeDocId: "d1",
      expanded: new Set(["f1"]),
    });
    render(<FolderTree />);
    expect(screen.getByLabelText("새 문서")).toBeTruthy();
    expect(screen.getByLabelText("폴더 삭제")).toBeTruthy();
    expect(screen.getByLabelText("문서 삭제")).toBeTruthy();
  });

  it("접힌 폴더는 하위 문서 숨김(S4)", () => {
    useWorkspaceStore.setState({
      folders: [{ id: "f1", name: "폴더A", parentId: null, createdAt: 1 }],
      documents: [{ id: "d1", folderId: "f1", title: "문서1", createdAt: 1, updatedAt: 1 }],
      activeDocId: null,
      expanded: new Set(), // 접힘
    });
    render(<FolderTree />);
    expect(screen.queryByText("문서1")).toBeNull();
  });
});
