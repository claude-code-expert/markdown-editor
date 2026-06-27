"use client";

import { Check, X, AlertTriangle } from "lucide-react";

export type ToastKind = "ok" | "error" | "info";

/**
 * 공통 토스트 — docs/html/ui-kit.html `.to-item`(white bg·좌측 3px 의미색 보더·아이콘) 구조 차용.
 * 비차단·하단 중앙 고정. 성공/실패/안내를 좌측 보더 색 + 아이콘으로 구분(헌법 V: 컬러 그림자·글로우 금지).
 */
const accent: Record<ToastKind, string> = {
  ok: "var(--ok)",
  error: "var(--danger)",
  info: "var(--fg-faint)",
};

export function Toast({ msg, kind }: { msg: string; kind: ToastKind }) {
  const Icon = kind === "ok" ? Check : kind === "error" ? X : AlertTriangle;
  return (
    <div
      role="status"
      aria-live={kind === "error" ? "assertive" : "polite"}
      className="fixed left-1/2 flex items-center gap-2.5 font-medium"
      style={{
        bottom: 30,
        transform: "translateX(-50%)",
        background: "var(--bg)",
        color: "var(--fg)",
        padding: "10px 14px",
        fontSize: 13,
        borderRadius: 6,
        border: "1px solid var(--border)",
        borderLeft: `3px solid ${accent[kind]}`,
        boxShadow: "0 4px 12px rgba(15,23,42,0.10)",
      }}
    >
      <Icon size={15} style={{ color: accent[kind] }} aria-hidden />
      <span>{msg}</span>
    </div>
  );
}
