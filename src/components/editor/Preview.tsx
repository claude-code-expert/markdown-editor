"use client";

import { useEffect, useState } from "react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { renderMarkdown } from "@/lib/markdown/pipeline";

/**
 * 프리뷰 — doc 변경을 120ms 트레일링 디바운스 후 렌더(R2·SC-001, 150ms 예산 내 헤드룸).
 * 렌더는 sanitize를 통과한 안전 HTML(헌법 원칙 II)이므로 dangerouslySetInnerHTML 안전.
 */
export function Preview() {
  const doc = useEditorStore((s) => s.doc);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setHtml(renderMarkdown(doc)), 120);
    return () => clearTimeout(id);
  }, [doc]);

  return (
    <div
      className="md-preview h-full overflow-auto"
      style={{ padding: "30px 40px 60px" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
