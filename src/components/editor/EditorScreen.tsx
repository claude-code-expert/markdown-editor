"use client";

import { useEffect, useRef, useState } from "react";
import { Toolbar } from "./Toolbar";
import { MarkdownEditor } from "./MarkdownEditor";
import { Preview } from "./Preview";
import { StatusBar } from "./StatusBar";
import { Dialog } from "./Dialog";
import { TableActions } from "./TableActions";
import { Sidebar } from "./Sidebar";
import { FolderSelect } from "./FolderSelect";
import { DocTitle } from "./DocTitle";
import { ViewModeToggle, type ViewMode } from "./ViewModeToggle";
import { DownloadMd } from "./DownloadMd";
import { Group, Panel, Separator } from "react-resizable-panels";
import Link from "next/link";
import { LayoutGrid, X } from "lucide-react";
import type { EditorController } from "./controller";
import type { MarkdownPlugin } from "@/plugins";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { syncScroll } from "@/lib/scroll/syncScroll";
import { mayDiscard, DISCARD_MESSAGE } from "@/lib/util/dirtyGuard";

/** 단일 화면 조립: 헤더 + 툴바 + 에디터:프리뷰 50:50 + 상태바. dc.html 시각 구조 매칭. */
export function EditorScreen() {
  const controllerRef = useRef<EditorController>(null);
  const [dialogPlugin, setDialogPlugin] = useState<MarkdownPlugin | null>(null);
  const dirty = useEditorStore((s) => s.dirty);
  const inTable = useEditorStore((s) => s.inTable);
  const initialized = useEditorStore((s) => s.initialized);
  const previewRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ViewMode>("split"); // 보기 모드(분할·프리뷰·프레젠테이션)

  // 클라 네비라 beforeunload 미발화 → dirty 가드 직접(FR-008·S1). 로고·대시보드 링크 공용.
  function guardNav(e: { preventDefault: () => void }) {
    if (!mayDiscard(dirty, () => window.confirm(DISCARD_MESSAGE)))
      e.preventDefault();
  }

  // M6: 로드·활성문서 선택은 라우트(/editor/[docId])가 구동 — EditorScreen은 렌더·편집만.

  // 스크롤 동기화 — 에디터 스크롤러 ↔ 프리뷰 컨테이너 (M4). 분할 모드에서만 양쪽이 존재.
  useEffect(() => {
    if (!initialized || mode !== "split") return;
    const editorEl = controllerRef.current?.getScroller();
    const previewEl = previewRef.current;
    if (!editorEl || !previewEl) return;
    return syncScroll(editorEl, previewEl);
  }, [initialized, mode]);

  // 프레젠테이션 모드 — ESC로 분할 보기 복귀
  useEffect(() => {
    if (mode !== "present") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMode("split");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

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
        {/* 로고 클릭 → root 대시보드(dirty 가드). 디자인의 그라데이션 대신 단색 액센트(헌법 V) */}
        <Link
          href="/"
          aria-label="대시보드로"
          title="대시보드로 이동"
          onClick={guardNav}
          className="flex items-center gap-2.5 rounded-md px-1 py-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
        >
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
        </Link>

        {/* 대시보드 이동 + 저장 폴더 선택 (M6) */}
        <Link
          href="/"
          aria-label="대시보드로"
          title="대시보드"
          onClick={guardNav}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] hover:bg-[color:var(--bg-subtle)]"
          style={{ color: "var(--fg-muted)" }}
        >
          <LayoutGrid size={15} aria-hidden />
          대시보드
        </Link>

        <div className="ml-auto">
          <FolderSelect />
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
          {/* 문서 타이틀 영역 — 툴바 상단(M7). 클릭 시 인라인 편집(rename) */}
          <DocTitle />

          <Toolbar
            onApply={(p) => controllerRef.current?.applyPlugin(p)}
            onRequestDialog={(p) => setDialogPlugin(p)}
            rightSlot={
              <>
                <ViewModeToggle mode={mode} onChange={setMode} />
                <span
                  aria-hidden
                  className="mx-0.5 inline-block"
                  style={{ width: 1, height: 22, background: "var(--border-strong)" }}
                />
                <DownloadMd />
              </>
            }
          />

          {inTable && mode === "split" && (
            <TableActions onOp={(op) => controllerRef.current?.applyDocOp(op)} />
          )}

          {/* 본문 — 모드별 레이아웃. split: 에디터|프리뷰, preview: 프리뷰 전용, present: 오버레이(아래) */}
          {mode === "split" ? (
            <Group orientation="horizontal" className="flex flex-1 min-h-0">
              <Panel
                defaultSize="50%"
                minSize="25%"
                className="flex min-w-0 flex-col"
                style={{ background: "var(--bg-editor)" }}
              >
                <section aria-label="마크다운 에디터" className="flex h-full flex-col">
                  <PanelLabel dot="var(--accent)" text="MARKDOWN" />
                  <div className="flex-1 min-h-0">
                    <MarkdownEditor ref={controllerRef} />
                  </div>
                </section>
              </Panel>

              <Separator
                className="md-resize-handle"
                aria-label="에디터·프리뷰 크기 조절"
              />

              <Panel
                groupResizeBehavior="preserve-relative-size"
                minSize="25%"
                className="flex min-w-0 flex-col"
                style={{ background: "var(--bg)" }}
              >
                <section aria-label="미리보기" className="flex h-full flex-col">
                  <PanelLabel dot="var(--ok)" text="미리보기" />
                  <div className="flex-1 min-h-0">
                    <Preview ref={previewRef} />
                  </div>
                </section>
              </Panel>
            </Group>
          ) : mode === "preview" ? (
            <section
              aria-label="미리보기"
              className="flex flex-1 min-h-0 flex-col"
              style={{ background: "var(--bg)" }}
            >
              <PanelLabel dot="var(--ok)" text="미리보기" />
              <div className="flex-1 min-h-0">
                <Preview ref={previewRef} />
              </div>
            </section>
          ) : (
            // present: 본문은 비우고 전체화면 오버레이로 렌더(아래)
            <div className="flex-1" />
          )}
        </Panel>
      </Group>

      <StatusBar />

      {/* 프레젠테이션 모드 — 전체화면 프리뷰 오버레이. ESC 또는 ✕로 종료 */}
      {mode === "present" && (
        <div
          role="region"
          aria-label="프레젠테이션"
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--bg)" }}
        >
          <button
            type="button"
            onClick={() => setMode("split")}
            aria-label="프레젠테이션 종료 (ESC)"
            title="프레젠테이션 종료 (ESC)"
            className="md-tool-btn"
            style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}
          >
            <X size={17} strokeWidth={1.9} aria-hidden />
          </button>
          <div className="flex-1 min-h-0">
            <Preview />
          </div>
        </div>
      )}

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
