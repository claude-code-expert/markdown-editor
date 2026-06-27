"use client";

import { Fragment } from "react";
import type { ReactNode } from "react";
import { PLUGINS } from "@/plugins";
import type { MarkdownPlugin } from "@/plugins";
import { useEditorStore } from "@/lib/store/useEditorStore";

/**
 * 툴바 — 레지스트리(PLUGINS)를 순회 렌더할 뿐 개별 플러그인을 알지 못한다(격리 불변식, 헌법 I).
 * 그룹 경계(plugin.group 변화)마다 구분선. activeIds 구독해 적용된 서식 버튼을 활성 표시.
 * 버튼은 테두리 + hover/active(클릭) 효과(.md-tool-btn).
 * rightSlot — 플러그인과 무관한 우측 컨트롤(보기 모드·다운로드 등)을 끼우는 슬롯(격리 유지).
 */
export function Toolbar({
  onApply,
  onRequestDialog,
  rightSlot,
}: {
  onApply: (plugin: MarkdownPlugin) => void;
  onRequestDialog: (plugin: MarkdownPlugin) => void;
  rightSlot?: ReactNode;
}) {
  const activeIds = useEditorStore((s) => s.activeIds);

  return (
    <div
      role="toolbar"
      aria-label="서식 도구 모음"
      className="flex flex-wrap items-center gap-1 px-3 py-2 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {PLUGINS.map((plugin, i) => {
        const Icon = plugin.icon;
        const prev = PLUGINS[i - 1];
        const showDivider = prev && prev.group !== plugin.group;
        const active = activeIds.includes(plugin.id);
        return (
          <Fragment key={plugin.id}>
            {showDivider && (
              <span
                aria-hidden
                className="mx-1 inline-block"
                style={{ width: 1, height: 22, background: "var(--border-strong)" }}
              />
            )}
            <button
              type="button"
              className="md-tool-btn"
              data-active={plugin.isActive && active ? "true" : undefined}
              aria-label={plugin.label}
              aria-pressed={plugin.isActive ? active : undefined}
              title={
                plugin.shortcut ? `${plugin.label} (${plugin.shortcut})` : plugin.label
              }
              onClick={() =>
                plugin.dialog ? onRequestDialog(plugin) : onApply(plugin)
              }
            >
              <Icon size={17} strokeWidth={1.9} aria-hidden />
            </button>
          </Fragment>
        );
      })}

      {rightSlot && (
        <div className="ml-auto flex items-center gap-1.5 pl-2">{rightSlot}</div>
      )}
    </div>
  );
}
