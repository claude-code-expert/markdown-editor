"use client";

import { FolderPlus } from "lucide-react";

/**
 * 사이드바 (M2 — 레이아웃 셸). 와이어프레임 구조: [+] 폴더 생성 자리 + 폴더/문서 트리 영역.
 * 데이터·CRUD·다중 문서는 M3(저장소). M2는 빈 상태 안내를 보여준다.
 */
export function Sidebar() {
  return (
    <aside
      aria-label="문서 탐색기"
      className="flex h-full flex-col"
      style={{ background: "var(--bg-subtle)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.09em",
            color: "var(--fg-faint)",
          }}
        >
          탐색기
        </span>
        <button
          type="button"
          aria-label="폴더 생성"
          title="폴더 생성 (M3에서 제공)"
          disabled
          className="inline-flex items-center justify-center rounded-md disabled:opacity-40"
          style={{ width: 26, height: 26, color: "var(--fg-muted)" }}
        >
          <FolderPlus size={15} aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-auto px-3 py-3">
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--fg-faint)" }}>
          폴더·문서 트리는 다음 단계에서 제공됩니다.
          <br />
          <span style={{ fontSize: 11.5 }}>(M3: 폴더 생성 · 문서 관리 · 저장소)</span>
        </p>
      </div>
    </aside>
  );
}
