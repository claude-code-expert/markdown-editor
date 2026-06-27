"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { countDoc } from "@/lib/util/count";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";

/** 하단 상태바 — 문자수·줄수(FR-016) + 저장/취소 + 토스트. 저장은 활성 문서에 기록(M3). */
export function StatusBar() {
  const doc = useEditorStore((s) => s.doc);
  const dirty = useEditorStore((s) => s.dirty);
  const cancel = useEditorStore((s) => s.cancel);
  const saveActive = useWorkspaceStore((s) => s.saveActive);
  const documents = useWorkspaceStore((s) => s.documents);
  const folders = useWorkspaceStore((s) => s.folders);
  const activeDocId = useWorkspaceStore((s) => s.activeDocId);
  const activeDoc = documents.find((d) => d.id === activeDocId);
  const title = activeDoc?.title ?? "제목 없음";
  const folderName =
    folders.find((f) => f.id === activeDoc?.folderId)?.name ?? "기타";
  const [toast, setToast] = useState<{
    msg: string;
    kind: "ok" | "error" | "info";
  } | null>(null);
  const { chars, lines } = countDoc(doc);

  /** resource/md/<제목>.md 파일로 기록(서버 라우트). 실패해도 IndexedDB 저장은 유지. */
  async function saveToFile(): Promise<{ ok: boolean; error?: string }> {
    try {
      const r = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: doc, folder: folderName }),
      });
      const data = await r.json();
      return { ok: Boolean(data?.ok), error: data?.error };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "네트워크 오류" };
    }
  }

  async function handleSave() {
    // 1) IndexedDB(앱 상태) → 2) 성공 시 resource/md 파일 기록
    const res = await saveActive();
    if (!res.ok) {
      setToast({ msg: `저장 실패: ${res.error ?? ""}`, kind: "error" });
      window.setTimeout(() => setToast(null), 1900);
      return;
    }
    const file = await saveToFile();
    setToast(
      file.ok
        ? { msg: `저장되었습니다 (resource/md/${folderName})`, kind: "ok" }
        : { msg: `파일 저장 실패: ${file.error ?? ""}`, kind: "error" },
    );
    window.setTimeout(() => setToast(null), 1900);
  }

  function handleCancel() {
    cancel();
    setToast({ msg: "마지막 저장 상태로 되돌렸습니다", kind: "info" });
    window.setTimeout(() => setToast(null), 1900);
  }

  return (
    <>
      <div
        className="flex items-center justify-between border-t px-5 py-3"
        style={{ borderColor: "var(--border)", background: "var(--bg)" }}
      >
        <div
          className="flex items-center gap-4"
          style={{ fontSize: 12.5, color: "var(--fg-faint)" }}
        >
          <span>{chars.toLocaleString()}자</span>
          <span aria-hidden style={{ width: 1, height: 13, background: "#e3e8f0" }} />
          <span>{lines.toLocaleString()}줄</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={handleCancel} disabled={!dirty}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save size={15} strokeWidth={2.1} aria-hidden />
            저장
          </Button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} kind={toast.kind} />}
    </>
  );
}
