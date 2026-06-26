"use client";

import { useState } from "react";
import type { DialogField } from "@/plugins/types";

/**
 * 다중 필드 입력 다이얼로그 (M2). 참조링크(id+url)·코드언어·링크/이미지(url)를 단일 메커니즘으로.
 * 제출 시 { key: value } 맵을 돌려준다.
 */
export function Dialog({
  title,
  fields,
  onSubmit,
  onClose,
}: {
  title: string;
  fields: DialogField[];
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.3)" }}
      onClick={onClose}
    >
      <div
        className="w-80 rounded p-4"
        style={{ background: "var(--bg)", border: "1px solid var(--border-strong)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-sm font-semibold">{title}</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(values);
          }}
        >
          {fields.map((f, i) => (
            <label key={f.key} className="mb-3 block">
              <span className="mb-1 block text-xs" style={{ color: "var(--fg-muted)" }}>
                {f.label}
                {f.optional ? " (선택)" : ""}
              </span>
              <input
                autoFocus={i === 0}
                type="text"
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                aria-label={`${f.label} 입력`}
                className="w-full rounded px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                style={{ border: "1px solid var(--border-strong)" }}
              />
            </label>
          ))}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded px-3 py-1 text-sm"
              style={{ border: "1px solid var(--border-strong)" }}
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded px-3 py-1 text-sm"
              style={{ background: "var(--accent)", color: "var(--accent-fg)" }}
            >
              삽입
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
