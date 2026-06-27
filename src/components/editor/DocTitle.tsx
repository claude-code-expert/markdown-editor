"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Pencil } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";

/**
 * 툴바 상단 문서 제목 — 클릭(또는 연필) 시 인라인 편집. Enter·blur 저장, Esc 취소.
 * 저장은 워크스페이스 스토어 renameDocument(동일 폴더 중복 제목 → 접미사, FR-009).
 * dirty면 ● 표시. 활성 문서 없으면 편집 비활성.
 */
export function DocTitle() {
  const documents = useWorkspaceStore((s) => s.documents);
  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const renameDocument = useWorkspaceStore((s) => s.renameDocument);
  const dirty = useEditorStore((s) => s.dirty);

  const title = documents.find((d) => d.id === activeDocId)?.title ?? "제목 없음";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function startEdit() {
    if (!activeDocId) return;
    setDraft(title);
    setEditing(true);
  }

  function commit() {
    if (!editing) return;
    setEditing(false);
    const next = draft.trim();
    if (activeDocId && next && next !== title) renameDocument(activeDocId, next);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditing(false); // 취소 — 저장 안 함
    }
  }

  return (
    <div
      className="flex items-center gap-2.5 border-b px-4 py-3"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <FileText size={22} style={{ color: "var(--fg-muted)" }} aria-hidden />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          aria-label="문서 제목 편집"
          className="min-w-0 flex-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          style={{
            // 프리뷰 .md-preview h1과 동일 메트릭(30/800/-0.02em/#141b2b)
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            color: "#141b2b",
            border: "1px solid var(--border-strong)",
            padding: "2px 10px",
          }}
        />
      ) : (
        <button
          type="button"
          onClick={startEdit}
          disabled={!activeDocId}
          title={activeDocId ? "클릭하여 제목 편집" : title}
          className="group flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-0.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] enabled:hover:bg-[color:var(--bg-subtle)] disabled:cursor-default"
        >
          <h1
            className="truncate"
            style={{
              // 프리뷰 .md-preview h1과 동일 메트릭(30/800/-0.02em/#141b2b)
              fontSize: 30,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.3,
              color: "#141b2b",
            }}
          >
            {title}
          </h1>
          {activeDocId && (
            <Pencil
              size={16}
              aria-hidden
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              style={{ color: "var(--fg-faint)" }}
            />
          )}
        </button>
      )}

      {dirty && (
        <span
          aria-label="저장되지 않음"
          title="저장되지 않은 변경"
          className="shrink-0"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--accent)",
          }}
        />
      )}
    </div>
  );
}
