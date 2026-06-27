"use client";

import {
  Folder,
  FolderOpen,
  FileText,
  FilePlus,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { useEditorStore } from "@/lib/store/useEditorStore";

const iconBtn =
  "inline-flex h-6 w-6 items-center justify-center rounded text-[color:var(--fg-faint)] hover:text-[color:var(--fg)] hover:bg-[color:var(--border-soft)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]";

/** 폴더>문서 트리 (1단계). 데이터·동작은 워크스페이스 스토어. 표시·이벤트만(sidebar-tree.md). */
export function FolderTree() {
  const folders = useWorkspaceStore((s) => s.folders);
  const documents = useWorkspaceStore((s) => s.documents);
  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const expanded = useWorkspaceStore((s) => s.expanded);
  const toggleExpand = useWorkspaceStore((s) => s.toggleExpand);
  const createDocument = useWorkspaceStore((s) => s.createDocument);
  const renameFolder = useWorkspaceStore((s) => s.renameFolder);
  const deleteFolder = useWorkspaceStore((s) => s.deleteFolder);
  const renameDocument = useWorkspaceStore((s) => s.renameDocument);
  const deleteDocument = useWorkspaceStore((s) => s.deleteDocument);
  const router = useRouter();

  // 문서 클릭 → URL 네비게이션(M6 R6). dirty 보호(FR-010): 미저장 변경 시 확인.
  function openDoc(id: string) {
    if (id === activeDocId) return;
    if (
      useEditorStore.getState().dirty &&
      !window.confirm("저장하지 않은 변경이 있습니다. 버리고 이동할까요?")
    )
      return;
    router.push(`/editor/${id}`);
  }

  // 새 문서 생성 후 그 문서로 네비게이션(URL 일치)
  async function newDoc(folderId: string) {
    await createDocument(folderId);
    const id = useWorkspaceStore.getState().activeDocId;
    if (id) router.push(`/editor/${id}`);
  }

  if (folders.length === 0) {
    return (
      <p className="px-2 py-2 text-xs" style={{ color: "var(--fg-faint)" }}>
        폴더가 없습니다. 상단 [+]로 폴더를 만드세요.
      </p>
    );
  }

  return (
    <ul role="tree" aria-label="폴더 및 문서" className="space-y-0.5">
      {folders.map((f) => {
        const open = expanded.has(f.id);
        const docs = documents.filter((d) => d.folderId === f.id);
        return (
          <li key={f.id} role="treeitem" aria-expanded={open}>
            <div className="group flex items-center gap-1 rounded px-1 py-1 hover:bg-[color:var(--border-soft)]">
              <button
                type="button"
                aria-label={open ? "폴더 접기" : "폴더 펼치기"}
                onClick={() => toggleExpand(f.id)}
                className={iconBtn}
              >
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {open ? (
                <FolderOpen size={15} style={{ color: "var(--fg-muted)" }} />
              ) : (
                <Folder size={15} style={{ color: "var(--fg-muted)" }} />
              )}
              <span className="flex-1 truncate text-sm" style={{ color: "var(--fg)" }}>
                {f.name}
              </span>
              <button type="button" aria-label="새 문서" title="새 문서" onClick={() => newDoc(f.id)} className={iconBtn}>
                <FilePlus size={13} />
              </button>
              <button
                type="button"
                aria-label="폴더 이름변경"
                onClick={() => {
                  const n = window.prompt("폴더 이름", f.name);
                  if (n) renameFolder(f.id, n);
                }}
                className={iconBtn}
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                aria-label="폴더 삭제"
                onClick={() => {
                  if (window.confirm(`'${f.name}' 폴더와 하위 문서를 모두 삭제할까요?`))
                    deleteFolder(f.id);
                }}
                className={iconBtn}
              >
                <Trash2 size={13} />
              </button>
            </div>

            {open && (
              <ul
                role="group"
                className="ml-7 space-y-0.5 border-l pl-2"
                style={{ borderColor: "var(--border)" }}
              >
                {docs.length === 0 && (
                  <li className="px-2 py-1 text-xs" style={{ color: "var(--fg-faint)" }}>
                    (문서 없음)
                  </li>
                )}
                {docs.map((d) => {
                  const active = d.id === activeDocId;
                  return (
                    <li key={d.id} role="treeitem" aria-selected={active}>
                      <div
                        className="group flex items-center gap-1 rounded px-1 py-1 hover:bg-[color:var(--border-soft)]"
                        style={{ background: active ? "#eef1fb" : "transparent" }}
                      >
                        <FileText
                          size={14}
                          style={{ color: active ? "var(--accent)" : "var(--fg-muted)" }}
                        />
                        <button
                          type="button"
                          onClick={() => openDoc(d.id)}
                          className="flex-1 truncate text-left text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                          style={{ color: active ? "var(--accent)" : "var(--fg)" }}
                        >
                          {d.title}
                        </button>
                        <button
                          type="button"
                          aria-label="문서 이름변경"
                          onClick={() => {
                            const n = window.prompt("문서 제목", d.title);
                            if (n) renameDocument(d.id, n);
                          }}
                          className={iconBtn}
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          type="button"
                          aria-label="문서 삭제"
                          onClick={() => {
                            if (window.confirm(`'${d.title}' 문서를 삭제할까요?`))
                              deleteDocument(d.id);
                          }}
                          className={iconBtn}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
