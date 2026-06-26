"use client";

import { Fragment } from "react";
import { PLUGINS } from "@/plugins";
import type { MarkdownPlugin } from "@/plugins";
import { useEditorStore } from "@/lib/store/useEditorStore";

/**
 * 툴바 — 레지스트리(PLUGINS)를 순회 렌더할 뿐 개별 플러그인을 알지 못한다(격리 불변식, 헌법 I).
 * 그룹 경계(plugin.group 변화)마다 디바이더 삽입. activeIds 구독해 적용된 서식 버튼을 활성 표시(US2).
 */
export function Toolbar({
  onApply,
  onRequestDialog,
}: {
  onApply: (plugin: MarkdownPlugin) => void;
  onRequestDialog: (plugin: MarkdownPlugin) => void;
}) {
  const activeIds = useEditorStore((s) => s.activeIds);

  return (
    <div
      role="toolbar"
      aria-label="서식 도구 모음"
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b"
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
                className="mx-1.5 inline-block"
                style={{ width: 1, height: 20, background: "var(--border)" }}
              />
            )}
            <button
              type="button"
              aria-label={plugin.label}
              aria-pressed={plugin.isActive ? active : undefined}
              title={
                plugin.shortcut ? `${plugin.label} (${plugin.shortcut})` : plugin.label
              }
              onClick={() =>
                plugin.dialog ? onRequestDialog(plugin) : onApply(plugin)
              }
              className="inline-flex items-center justify-center rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              style={{
                width: 34,
                height: 34,
                color: active ? "var(--accent)" : "var(--fg-muted)",
                background: active ? "#eef1fb" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (active) return;
                e.currentTarget.style.background = "var(--toolbar-hover)";
                e.currentTarget.style.color = "#1f2a44";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = active ? "#eef1fb" : "transparent";
                e.currentTarget.style.color = active ? "var(--accent)" : "var(--fg-muted)";
              }}
            >
              <Icon size={18} strokeWidth={1.9} aria-hidden />
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
