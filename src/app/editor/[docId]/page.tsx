"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { EditorScreen } from "@/components/editor/EditorScreen";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { getDocument } from "@/lib/storage/documents";

/**
 * 에디터 라우트 — URL의 docId가 활성 문서의 단일 출처(M6 R2·R3).
 * loadAll(멱등) 후 해당 문서 선택, 없으면 대시보드로 리다이렉트(FR-005).
 */
export default function EditorPage() {
  const params = useParams<{ docId: string }>();
  const router = useRouter();
  const docId = String(params.docId);
  const loadAll = useWorkspaceStore((s) => s.loadAll);
  const selectDocument = useWorkspaceStore((s) => s.selectDocument);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadAll();
      const doc = await getDocument(docId);
      if (!active) return;
      if (doc) await selectDocument(docId);
      else router.replace("/"); // 없는 주소 → 대시보드(FR-005·SC-006)
    })();
    return () => {
      active = false;
    };
  }, [docId, loadAll, selectDocument, router]);

  return <EditorScreen />;
}
