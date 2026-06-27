"use client";

import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";

/** 상단 저장 폴더 선택 — 활성 문서의 폴더 표시·변경(moveDocument). 폴더 없으면 안내(M6 F1~F3·F6). */
export function FolderSelect() {
  const folders = useWorkspaceStore((s) => s.folders);
  const documents = useWorkspaceStore((s) => s.documents);
  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const moveDocument = useWorkspaceStore((s) => s.moveDocument);

  const activeDoc = documents.find((d) => d.id === activeDocId);
  const currentFolder = activeDoc?.folderId ?? "";

  if (folders.length === 0) {
    return (
      <span
        role="status"
        aria-label="저장 폴더 없음 안내"
        className="text-xs"
        style={{ color: "var(--danger)" }}
      >
        폴더를 먼저 만드세요
      </span>
    );
  }

  return (
    <label className="flex items-center gap-1.5">
      <span className="text-xs" style={{ color: "var(--fg-faint)" }}>
        폴더
      </span>
      <select
        aria-label="저장 폴더 선택"
        value={currentFolder}
        disabled={!activeDocId}
        onChange={(e) => {
          if (activeDocId) moveDocument(activeDocId, e.target.value);
        }}
        className="rounded-md px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] disabled:opacity-50"
        style={{ border: "1px solid var(--border-strong)", color: "var(--fg)" }}
      >
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </label>
  );
}
