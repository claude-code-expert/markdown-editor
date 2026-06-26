"use client";

import { useEffect, useRef, useState } from "react";
import { Toolbar } from "./Toolbar";
import { MarkdownEditor } from "./MarkdownEditor";
import { Preview } from "./Preview";
import { StatusBar } from "./StatusBar";
import { Dialog } from "./Dialog";
import { TableActions } from "./TableActions";
import { Sidebar } from "./Sidebar";
import { Group, Panel, Separator } from "react-resizable-panels";
import type { EditorController } from "./controller";
import type { MarkdownPlugin } from "@/plugins";
import { useEditorStore } from "@/lib/store/useEditorStore";

/** 단일 화면 조립: 헤더 + 툴바 + 에디터:프리뷰 50:50 + 상태바. dc.html 시각 구조 매칭. */
export function EditorScreen() {
  const controllerRef = useRef<EditorController>(null);
  const [dialogPlugin, setDialogPlugin] = useState<MarkdownPlugin | null>(null);
  const init = useEditorStore((s) => s.init);
  const dirty = useEditorStore((s) => s.dirty);
  const inTable = useEditorStore((s) => s.inTable);

  // 초기 로드: 저장본 우선, 없으면 시드(FR-013·FR-018)
  useEffect(() => {
    init();
  }, [init]);

  // 미저장 이탈 경고(FR-015)
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <div className="flex h-screen flex-col" style={{ background: "var(--bg)" }}>
      {/* 헤더 + 툴바 한 줄 (dc.html 상단 바) */}
      <header
        className="flex items-center gap-3.5 px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2.5">
          {/* 로고 — 디자인의 그라데이션 대신 단색 액센트(헌법 V) */}
          <span
            className="inline-flex items-center justify-center font-extrabold"
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "var(--accent)",
              color: "#fff",
              fontFamily: "var(--font-mono)",
              fontSize: 14,
            }}
          >
            M
          </span>
          <span
            className="font-bold tracking-tight"
            style={{ fontSize: 14.5, color: "#2a3346" }}
          >
            Markdown Editor
          </span>
        </div>
      </header>

      {/* 사이드바 | 컨텐츠(툴바·에디터·프리뷰) — 가로 리사이즈 (M2 레이아웃) */}
      <Group orientation="horizontal" className="flex flex-1 min-h-0">
        <Panel
          defaultSize="260px"
          minSize="180px"
          maxSize="480px"
          className="border-r"
          style={{ borderColor: "var(--border)" }}
        >
          <Sidebar />
        </Panel>

        <Separator className="md-resize-handle" aria-label="사이드바 크기 조절" />

        <Panel
          groupResizeBehavior="preserve-relative-size"
          className="flex min-w-0 flex-col"
        >
          <Toolbar
            onApply={(p) => controllerRef.current?.applyPlugin(p)}
            onRequestDialog={(p) => setDialogPlugin(p)}
          />

          {inTable && (
            <TableActions onOp={(op) => controllerRef.current?.applyDocOp(op)} />
          )}

          <div className="flex flex-1 min-h-0">
            {/* 에디터 패널 */}
            <section
              aria-label="마크다운 에디터"
              className="flex flex-1 min-w-0 flex-col border-r"
              style={{ background: "var(--bg-editor)", borderColor: "var(--border)" }}
            >
              <PanelLabel dot="var(--accent)" text="MARKDOWN" />
              <div className="flex-1 min-h-0">
                <MarkdownEditor ref={controllerRef} />
              </div>
            </section>

            {/* 프리뷰 패널 */}
            <section
              aria-label="미리보기"
              className="flex flex-1 min-w-0 flex-col"
              style={{ background: "var(--bg)" }}
            >
              <PanelLabel dot="var(--ok)" text="미리보기" />
              <div className="flex-1 min-h-0">
                <Preview />
              </div>
            </section>
          </div>
        </Panel>
      </Group>

      <StatusBar />

      {dialogPlugin?.dialog && (
        <Dialog
          title={`${dialogPlugin.label} 삽입`}
          fields={dialogPlugin.dialog.fields}
          onSubmit={(values) => {
            controllerRef.current?.applyPlugin(dialogPlugin, values);
            setDialogPlugin(null);
          }}
          onClose={() => setDialogPlugin(null)}
        />
      )}
    </div>
  );
}

function PanelLabel({ dot, text }: { dot: string; text: string }) {
  return (
    <div
      className="flex items-center gap-2 px-5 py-2.5 border-b"
      style={{ borderColor: "var(--border-soft)" }}
    >
      <span
        aria-hidden
        style={{ width: 7, height: 7, borderRadius: "50%", background: dot }}
      />
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.09em",
          color: "var(--fg-faint)",
        }}
      >
        {text}
      </span>
    </div>
  );
}
