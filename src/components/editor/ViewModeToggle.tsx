"use client";

import { Columns2, Eye, Presentation } from "lucide-react";

/** 보기 모드 — 분할(에디터+프리뷰) · 프리뷰 전용 · 프레젠테이션(전체화면). */
export type ViewMode = "split" | "preview" | "present";

const MODES: { id: ViewMode; label: string; Icon: typeof Columns2 }[] = [
  { id: "split", label: "분할 보기 (에디터+프리뷰)", Icon: Columns2 },
  { id: "preview", label: "프리뷰 전용", Icon: Eye },
  { id: "present", label: "프레젠테이션 (전체화면)", Icon: Presentation },
];

/** 툴바 우측 세그먼트. 현재 모드 버튼은 활성표시(data-active). 플러그인 버튼과 동일한 .md-tool-btn 시각. */
export function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div role="group" aria-label="보기 모드" className="flex items-center gap-1">
      {MODES.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className="md-tool-btn"
          data-active={mode === id ? "true" : undefined}
          aria-pressed={mode === id}
          aria-label={label}
          title={label}
          onClick={() => onChange(id)}
        >
          <Icon size={17} strokeWidth={1.9} aria-hidden />
        </button>
      ))}
    </div>
  );
}
