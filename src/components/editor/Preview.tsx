"use client";

import { forwardRef, useEffect, useState } from "react";
import { useEditorStore } from "@/lib/store/useEditorStore";
import { renderMarkdown } from "@/lib/markdown/pipeline";

/**
 * 프리뷰 — doc 변경을 120ms 트레일링 디바운스 후 렌더(R2·SC-001, 150ms 예산 내 헤드룸).
 * 렌더는 sanitize를 통과한 안전 HTML(헌법 원칙 II)이므로 dangerouslySetInnerHTML 안전.
 * 스크롤 컨테이너를 ref로 노출(M4 스크롤 동기화).
 */
export const Preview = forwardRef<HTMLDivElement>(function Preview(_props, ref) {
  const doc = useEditorStore((s) => s.doc);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setHtml(renderMarkdown(doc)), 120);
    return () => clearTimeout(id);
  }, [doc]);

  return (
    <div
      ref={ref}
      className="md-preview h-full overflow-auto"
      style={{ padding: "30px 40px 60px" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
