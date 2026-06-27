"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { Button } from "@/components/ui/Button";

/** 대시보드 — 폴더>문서 트리(D1~D6). 폴더 펼침/접힘, 문서 클릭 → /editor/[id] (M6). */
export function Dashboard() {
  const router = useRouter();
  const loadAll = useWorkspaceStore((s) => s.loadAll);
  const documents = useWorkspaceStore((s) => s.documents);
  const folders = useWorkspaceStore((s) => s.folders);
  const expanded = useWorkspaceStore((s) => s.expanded);
  const toggleExpand = useWorkspaceStore((s) => s.toggleExpand);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // 빈 상태에서 새 문서 시작 — 폴더 없으면 기본 폴더 생성 후 문서 생성 → 에디터 이동
  async function startNew() {
    const ws = useWorkspaceStore.getState();
    let folderId = ws.folders[0]?.id;
    if (!folderId) {
      await ws.createFolder("내 문서");
      folderId = useWorkspaceStore.getState().folders[0].id;
    }
    await useWorkspaceStore.getState().createDocument(folderId);
    const id = useWorkspaceStore.getState().activeDocId;
    if (id) router.push(`/editor/${id}`);
  }

  const isEmpty = documents.length === 0 && folders.length === 0;

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--bg)" }}>
      <header
        className="flex items-center gap-2.5 px-5 py-3 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <span
          className="inline-flex items-center justify-center font-extrabold"
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "var(--accent)",
            color: "#fff",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
          }}
        >
          M
        </span>
        <span
          className="font-bold tracking-tight"
          style={{ fontSize: 15, color: "#2a3346" }}
        >
          내 문서
        </span>
      </header>

      <main className="flex-1 overflow-auto px-6 py-6">
        {isEmpty ? (
          <div
            className="mx-auto mt-20 max-w-md text-center"
            style={{ color: "var(--fg-faint)" }}
          >
            <p className="mb-2" style={{ fontSize: 15, color: "var(--fg-muted)" }}>
              아직 문서가 없습니다.
            </p>
            <p style={{ fontSize: 13 }}>
              새 문서를 만들어 작성을 시작하세요.
            </p>
            <Button variant="primary" onClick={startNew} className="mt-4">
              새 문서 시작
            </Button>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl">
            <ul aria-label="폴더 및 문서" className="flex flex-col gap-1">
              {folders.map((f) => {
                const open = expanded.has(f.id);
                const docs = documents
                  .filter((d) => d.folderId === f.id)
                  .sort((a, b) => b.updatedAt - a.updatedAt);
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(f.id)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] hover:bg-[color:var(--bg-subtle)]"
                    >
                      {open ? (
                        <ChevronDown size={15} style={{ color: "var(--fg-faint)" }} aria-hidden />
                      ) : (
                        <ChevronRight size={15} style={{ color: "var(--fg-faint)" }} aria-hidden />
                      )}
                      {open ? (
                        <FolderOpen size={16} style={{ color: "var(--fg-muted)" }} aria-hidden />
                      ) : (
                        <Folder size={16} style={{ color: "var(--fg-muted)" }} aria-hidden />
                      )}
                      <span className="flex-1 truncate font-semibold" style={{ color: "var(--fg)" }}>
                        {f.name}
                      </span>
                      <span className="text-xs tabular-nums" style={{ color: "var(--fg-faint)" }}>
                        {docs.length}
                      </span>
                    </button>

                    {open && (
                      <ul className="mb-1 ml-6 flex flex-col gap-0.5 border-l pl-2" style={{ borderColor: "var(--border)" }}>
                        {docs.length === 0 ? (
                          <li className="px-2 py-1.5 text-xs" style={{ color: "var(--fg-faint)" }}>
                            (문서 없음)
                          </li>
                        ) : (
                          docs.map((d) => (
                            <li key={d.id}>
                              <Link
                                href={`/editor/${d.id}`}
                                aria-label={`${d.title} 열기`}
                                className="flex items-center gap-2.5 rounded-md px-2 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] hover:bg-[color:var(--bg-subtle)]"
                              >
                                <FileText size={15} style={{ color: "var(--accent)" }} aria-hidden />
                                <span className="flex-1 truncate text-sm" style={{ color: "var(--fg)" }}>
                                  {d.title}
                                </span>
                                <span className="text-xs tabular-nums" style={{ color: "var(--fg-faint)" }}>
                                  {new Date(d.updatedAt).toLocaleDateString("ko-KR")}
                                </span>
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
