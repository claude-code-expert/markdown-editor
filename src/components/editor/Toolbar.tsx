"use client";

import { Fragment } from "react";
import { PLUGINS } from "@/plugins";
import type { MarkdownPlugin } from "@/plugins";
import { useEditorStore } from "@/lib/store/useEditorStore";

/**
 * 툴바 — 레지스트리(PLUGINS)를 순회 렌더할 뿐 개별 플러그인을 알지 못한다(격리 불변식, 헌법 I).
 * 그룹 경계(plugin.group 변화)마다 구분선 삽입. 버튼은 테두리 + hover/press/active 효과(globals .md-tool-btn).
 * activeIds 구독해 적용된 서식 버튼을 활성 표시.
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
      className="flex flex-wrap items-center gap-1 px-3 py-2 border-b"
      style={{ borderColor: "var(--border)" }}
    >
      {PLUGINS.map((plugin, i) => {
        const Icon = plugin.icon;
        const prev = PLUGINS[i - 1];
        const showSep = prev && prev.group !== plugin.group;
        const active = activeIds.includes(plugin.id);
        return (
          <Fragment key={plugin.id}>
            {showSep && <span aria-hidden className="md-tool-sep" />}
            <button
              type="button"
              aria-label={plugin.label}
              aria-pressed={plugin.isActive ? active : undefined}
              data-active={active ? "true" : undefined}
              title={
                plugin.shortcut ? `${plugin.label} (${plugin.shortcut})` : plugin.label
              }
              onClick={() =>
                plugin.dialog ? onRequestDialog(plugin) : onApply(plugin)
              }
              className="md-tool-btn"
            >
              <Icon size={18} strokeWidth={1.9} aria-hidden />
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
