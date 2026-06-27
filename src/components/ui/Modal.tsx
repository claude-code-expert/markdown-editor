"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

/**
 * 공통 모달 — docs/html/ui-kit.html `.modal-box`(white·radius 10·pad 24·width 320) 구조 차용.
 * 배경 클릭·ESC로 닫힘. 그림자는 중성 슬레이트 1단계(블러 < 20px, 헌법 V 준수 — ui-kit의 24px 블러는 하향).
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
  labelledBy = "modal-title",
}: {
  title: ReactNode;
  onClose: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // 첫 포커스 가능한 요소로 포커스 이동(접근성)
    boxRef.current?.querySelector<HTMLElement>(
      "input, button, select, textarea, [tabindex]",
    )?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15,23,42,0.4)" }}
      onClick={onClose}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="rounded-[10px]"
        style={{
          background: "var(--bg)",
          width: 320,
          maxWidth: "calc(100vw - 32px)",
          padding: 24,
          border: "1px solid var(--border)",
          boxShadow: "0 6px 16px rgba(15,23,42,0.10)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id={labelledBy}
          className="font-bold"
          style={{ fontSize: 16, color: "var(--fg)", margin: "0 0 8px" }}
        >
          {title}
        </h2>
        {children}
        {footer && (
          <div className="mt-4 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
