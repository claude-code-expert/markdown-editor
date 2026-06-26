"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { countDoc } from "@/lib/util/count";

/** 하단 상태바 — 문자수·줄수(FR-016) + 저장/취소(FR-011·012·014) + 토스트. dc.html 매칭. */
export function StatusBar() {
  const doc = useEditorStore((s) => s.doc);
  const dirty = useEditorStore((s) => s.dirty);
  const save = useEditorStore((s) => s.save);
  const cancel = useEditorStore((s) => s.cancel);
  const [toast, setToast] = useState<string | null>(null);
  const { chars, lines } = countDoc(doc);

  function handleSave() {
    const res = save();
    setToast(res.ok ? "저장되었습니다" : `저장 실패: ${res.error ?? ""}`);
    window.setTimeout(() => setToast(null), 1900);
  }

  function handleCancel() {
    cancel();
    setToast("마지막 저장 상태로 되돌렸습니다");
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
          <button
            type="button"
            onClick={handleCancel}
            disabled={!dirty}
            className="rounded-lg font-semibold disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            style={{
              height: 38,
              padding: "0 20px",
              fontSize: 14,
              border: "1px solid var(--border-strong)",
              background: "#fff",
              color: "#5a6577",
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[color:var(--accent)]"
            style={{
              height: 38,
              padding: "0 24px",
              fontSize: 14,
              border: "none",
              background: "var(--accent)",
              color: "var(--accent-fg)",
            }}
          >
            <Save size={16} strokeWidth={2.1} aria-hidden />
            저장
          </button>
        </div>
      </div>

      {/* 토스트 — 디자인의 컬러 그림자 대신 중성 그림자(헌법 V) */}
      {toast && (
        <div
          aria-live="polite"
          className="fixed left-1/2 flex items-center gap-2 rounded-lg font-semibold"
          style={{
            bottom: 30,
            transform: "translateX(-50%)",
            background: "#1c2434",
            color: "#fff",
            padding: "11px 20px",
            fontSize: 13.5,
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}
