"use client";

import { Download } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";

/** 파일명에 못 쓰는 문자 정리 + 빈 제목 방어. */
function safeFileName(title: string): string {
  const cleaned = title.replace(/[\\/:*?"<>|]/g, "").trim();
  return (cleaned || "제목 없음") + ".md";
}

/** 현재 보고 있는 마크다운 원문을 .md 파일로 다운로드. 편집 버퍼(doc)를 그대로 저장(저장본 아님). */
export function DownloadMd() {
  const doc = useEditorStore((s) => s.doc);
  const documents = useWorkspaceStore((s) => s.documents);
  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const title = documents.find((d) => d.id === activeDocId)?.title ?? "제목 없음";

  function download() {
    // text/markdown Blob → 임시 a[href=objectURL] 클릭 → 즉시 revoke(메모리 회수)
    const blob = new Blob([doc], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFileName(title);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      className="md-tool-btn"
      aria-label="마크다운(.md) 다운로드"
      title="마크다운(.md) 다운로드"
      onClick={download}
    >
      <Download size={17} strokeWidth={1.9} aria-hidden />
    </button>
  );
}
