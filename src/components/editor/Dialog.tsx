"use client";

import { useState } from "react";
import type { DialogField } from "@/plugins/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

/**
 * 다중 필드 입력 다이얼로그 (M2). 참조링크(id+url)·코드언어·링크/이미지(url)를 단일 메커니즘으로.
 * 공통 Modal/Button + ui-kit `.input-field` 스타일로 통일(헌법 V 준수). 제출 시 { key: value } 맵 반환.
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

  function submit() {
    onSubmit(values);
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={submit}>
            삽입
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {fields.map((f, i) => (
          <label key={f.key} className="mb-3 flex flex-col gap-1">
            <span className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
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
              className="rounded-md text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              style={{
                border: "1px solid var(--border-strong)",
                padding: "8px 12px",
              }}
            />
          </label>
        ))}
        {/* Enter 제출용 숨은 submit */}
        <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
      </form>
    </Modal>
  );
}
