"use client";

import { Rows3, Columns3, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import type { EditorChange } from "@/plugins/types";
import {
  addRow,
  addColumn,
  setColumnAlign,
  currentColumn,
  type Align,
} from "@/lib/markdown/tableOps";

type Op = (doc: string, pos: number) => EditorChange;

/**
 * 표 편집 컨텍스트 바 — 커서가 표 안일 때만 표시(EditorScreen이 inTable로 제어).
 * 표 연산은 plugins/가 아닌 lib/markdown/tableOps(순수)를 호출(F1). 정렬은 현재 커서 열 대상.
 */
export function TableActions({ onOp }: { onOp: (op: Op) => void }) {
  const align = (a: Align): Op => (doc, pos) =>
    setColumnAlign(doc, pos, currentColumn(doc, pos), a);

  const buttons: { label: string; icon: typeof Rows3; op: Op }[] = [
    { label: "행 추가", icon: Rows3, op: addRow },
    { label: "열 추가", icon: Columns3, op: addColumn },
    { label: "왼쪽 정렬", icon: AlignLeft, op: align("left") },
    { label: "가운데 정렬", icon: AlignCenter, op: align("center") },
    { label: "오른쪽 정렬", icon: AlignRight, op: align("right") },
  ];

  return (
    <div
      role="toolbar"
      aria-label="표 편집"
      className="flex items-center gap-1 px-3 py-1.5 border-b"
      style={{ borderColor: "var(--border)", background: "var(--bg-subtle)" }}
    >
      <span className="mr-1 text-xs font-medium" style={{ color: "var(--fg-faint)" }}>
        표
      </span>
      {buttons.map((b) => {
        const Icon = b.icon;
        return (
          <button
            key={b.label}
            type="button"
            aria-label={b.label}
            title={b.label}
            onClick={() => onOp(b.op)}
            className="inline-flex items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
            style={{ width: 30, height: 30, color: "var(--fg-muted)" }}
          >
            <Icon size={16} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
