"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

/**
 * 공통 버튼 — docs/html/ui-kit.html `.btn`(pad 8/16·radius 6·13/600) 구조 차용.
 * 색은 앱 토큰(accent/danger) 유지: ui-kit accent로 전역 교체하면 제외 대상(툴바·프리뷰)까지 바뀌므로
 * 형태·비율만 통일한다. 그라데이션·글로우 없음(헌법 V).
 */
type Variant = "primary" | "secondary" | "danger";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold " +
  "transition-colors disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-1";

const variants: Record<Variant, string> = {
  primary: "bg-[color:var(--accent)] text-[color:var(--accent-fg)] hover:bg-[color:var(--accent-hover)]",
  secondary:
    "bg-[color:var(--bg)] text-[color:var(--fg)] border border-[color:var(--border-strong)] hover:bg-[color:var(--bg-subtle)]",
  danger: "bg-[color:var(--danger)] text-white hover:brightness-95",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
>(function Button({ variant = "secondary", className = "", type = "button", ...props }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      style={{ padding: "8px 16px", fontSize: 13, ...props.style }}
      {...props}
    />
  );
});
