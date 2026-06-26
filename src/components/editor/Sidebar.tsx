"use client";

import { FolderPlus } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { FolderTree } from "./FolderTree";

/** 사이드바 — [+] 폴더 생성 + 폴더>문서 트리(M3). 데이터는 워크스페이스 스토어. */
export function Sidebar() {
  const createFolder = useWorkspaceStore((s) => s.createFolder);

  function onNewFolder() {
    const name = window.prompt("폴더 이름", "새 폴더");
    if (name) createFolder(name);
  }

  return (
    <aside
      aria-label="문서 탐색기"
      className="flex h-full flex-col"
      style={{ background: "var(--bg-subtle)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: "var(--fg-faint)",
          }}
        >
          탐색기
        </span>
        <button
          type="button"
          aria-label="폴더 생성"
          title="폴더 생성"
          onClick={onNewFolder}
          className="inline-flex items-center justify-center rounded-md hover:bg-[color:var(--border-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          style={{ width: 26, height: 26, color: "var(--fg-muted)" }}
        >
          <FolderPlus size={15} aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-2 py-2">
        <FolderTree />
      </div>
    </aside>
  );
}
