"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState as CMState } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { defaultKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { PLUGINS, computeActiveIds } from "@/plugins";
import type { MarkdownPlugin } from "@/plugins";
import type { EditorChange } from "@/plugins/types";
import { isInTable } from "@/lib/markdown/tableOps";
import type { EditorController } from "./controller";

/**
 * CodeMirror 6 래퍼 + 순수 플러그인 어댑터(R1).
 * 플러그인은 EditorState{doc,selection}만 받고 EditorChange를 돌려준다 — CM 비종속.
 * 어댑터가 변환·dispatch를 담당해 격리(헌법 원칙 I)를 유지한다.
 */
export const MarkdownEditor = forwardRef<EditorController>(function MarkdownEditor(
  _props,
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  /**
   * 두 문서의 공통 접두/접미를 제외한 최소 변경 영역. 전체 교체 대신 이 범위만 dispatch하면
   * 뷰포트 위 영역이 그대로 유지돼 스크롤이 보존된다(툴바 적용 시 맨 위로 점프 방지).
   */
  function minimalChange(oldDoc: string, newDoc: string) {
    const oLen = oldDoc.length;
    const nLen = newDoc.length;
    const max = Math.min(oLen, nLen);
    let p = 0;
    while (p < max && oldDoc.charCodeAt(p) === newDoc.charCodeAt(p)) p++;
    let s = 0;
    while (
      s < max - p &&
      oldDoc.charCodeAt(oLen - 1 - s) === newDoc.charCodeAt(nLen - 1 - s)
    )
      s++;
    return { from: p, to: oLen - s, insert: newDoc.slice(p, nLen - s) };
  }
  const doc = useEditorStore((s) => s.doc);
  const setDoc = useEditorStore((s) => s.setDoc);
  const setActiveIds = useEditorStore((s) => s.setActiveIds);
  const setInTable = useEditorStore((s) => s.setInTable);
  const initialized = useEditorStore((s) => s.initialized);

  function applyChange(change: EditorChange) {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      changes: minimalChange(view.state.doc.toString(), change.doc),
      selection: { anchor: change.selectionStart, head: change.selectionEnd },
    });
    setDoc(change.doc);
    view.focus();
  }

  function applyDocOp(op: (doc: string, pos: number) => EditorChange) {
    const view = viewRef.current;
    if (!view) return;
    const sel = view.state.selection.main;
    applyChange(op(view.state.doc.toString(), sel.from));
  }

  function applyPlugin(plugin: MarkdownPlugin, inputs?: Record<string, string>) {
    const view = viewRef.current;
    if (!view) return;
    const sel = view.state.selection.main;
    const change = plugin.apply(
      {
        doc: view.state.doc.toString(),
        selectionStart: sel.from,
        selectionEnd: sel.to,
      },
      inputs,
    );
    view.dispatch({
      changes: minimalChange(view.state.doc.toString(), change.doc),
      selection: { anchor: change.selectionStart, head: change.selectionEnd },
    });
    setDoc(change.doc);
    view.focus();
  }

  // CM6 1회 생성(init 이후 시드/저장본 로드 완료 시점)
  useEffect(() => {
    if (!hostRef.current || viewRef.current || !initialized) return;
    const shortcutKeymap = keymap.of(
      PLUGINS.filter((p) => p.shortcut && !p.dialog).map((p) => ({
        key: p.shortcut as string,
        preventDefault: true,
        run: () => {
          applyPlugin(p);
          return true;
        },
      })),
    );
    const view = new EditorView({
      parent: hostRef.current,
      state: CMState.create({
        doc,
        extensions: [
          basicSetup,
          markdown(), // 에디터 마크다운 구문 강조 (US3, H1) — 표시 전용, 파이프라인 무관(H3)
          EditorView.lineWrapping,
          shortcutKeymap,
          keymap.of(defaultKeymap),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) setDoc(u.state.doc.toString());
            // 선택/문서 변경 → 활성표시 갱신(US2, SC-002)
            if (u.docChanged || u.selectionSet) {
              const sel = u.state.selection.main;
              const d = u.state.doc.toString();
              setActiveIds(
                computeActiveIds({
                  doc: d,
                  selectionStart: sel.from,
                  selectionEnd: sel.to,
                }),
              );
              setInTable(isInTable(d, sel.from));
            }
          }),
          EditorView.theme({
            "&": { height: "100%", fontSize: "13.5px", background: "transparent" },
            ".cm-scroller": {
              fontFamily: "var(--font-mono)",
              lineHeight: "1.85",
              color: "#3a4458",
            },
            ".cm-content": { padding: "24px 26px 40px" },
            ".cm-gutters": { background: "transparent", border: "none" },
            "&.cm-focused": { outline: "none" },
          }),
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized]);

  // 외부 doc 변경(취소/초기화) → CM에 반영. 동일하면 no-op(루프 방지).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== doc) {
      view.dispatch({ changes: minimalChange(current, doc) });
    }
  }, [doc]);

  useImperativeHandle(ref, () => ({
    applyPlugin,
    applyDocOp,
    isActive: (plugin) => {
      const view = viewRef.current;
      if (!view || !plugin.isActive) return false;
      const sel = view.state.selection.main;
      return plugin.isActive({
        doc: view.state.doc.toString(),
        selectionStart: sel.from,
        selectionEnd: sel.to,
      });
    },
    getScroller: () => viewRef.current?.scrollDOM ?? null,
    focus: () => viewRef.current?.focus(),
  }));

  return <div ref={hostRef} className="h-full overflow-auto" />;
});
