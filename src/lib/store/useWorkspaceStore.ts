import { create } from "zustand";
import type { Folder, DocumentMeta } from "@/lib/storage/db";
import * as foldersRepo from "@/lib/storage/folders";
import * as docsRepo from "@/lib/storage/documents";
import { migrate } from "@/lib/storage/migrate";
import { uniqueTitle } from "@/lib/util/uniqueTitle";
import { useEditorStore } from "./useEditorStore";

interface WorkspaceStore {
  folders: Folder[];
  documents: DocumentMeta[];
  activeDocId: string | null;
  expanded: Set<string>;
  loaded: boolean;

  loadAll: () => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  createDocument: (folderId: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  renameDocument: (id: string, title: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  moveDocument: (id: string, folderId: string) => Promise<void>;
  selectDocument: (id: string) => Promise<void>;
  saveActive: () => Promise<{ ok: boolean; error?: string }>;
  toggleExpand: (folderId: string) => void;
}

/** 동일 폴더 내 기존 문서 제목 목록(자기 자신 제외) */
function titlesInFolder(
  documents: DocumentMeta[],
  folderId: string,
  excludeId?: string,
): string[] {
  return documents
    .filter((d) => d.folderId === folderId && d.id !== excludeId)
    .map((d) => d.title);
}

async function refresh(set: (p: Partial<WorkspaceStore>) => void) {
  const [folders, documents] = await Promise.all([
    foldersRepo.listFolders(),
    docsRepo.listAllMeta(),
  ]);
  set({ folders, documents });
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  folders: [],
  documents: [],
  activeDocId: null,
  expanded: new Set(),
  loaded: false,

  loadAll: async () => {
    if (get().loaded) return; // R2: 멱등 — 두 페이지(대시보드·에디터) 안전 호출
    await migrate(); // 멱등(플래그 기반) + 빈 문서 1건 시드 보장
    await refresh(set);
    set({ loaded: true });
    // M6: 활성 문서 선택은 URL(라우트)이 단일 출처 — 첫 문서 자동선택 제거
  },

  createFolder: async (name) => {
    const f = await foldersRepo.createFolder(name);
    await refresh(set);
    set((s) => ({ expanded: new Set(s.expanded).add(f.id) }));
  },

  createDocument: async (folderId) => {
    // FR-009: 동일 폴더 중복 제목 → 접미사
    const title = uniqueTitle(titlesInFolder(get().documents, folderId), "제목 없음");
    const d = await docsRepo.createDocument(folderId, title);
    await refresh(set);
    set((s) => ({ expanded: new Set(s.expanded).add(folderId) }));
    await get().selectDocument(d.id);
  },

  renameFolder: async (id, name) => {
    await foldersRepo.renameFolder(id, name);
    await refresh(set);
  },

  renameDocument: async (id, title) => {
    const doc = get().documents.find((d) => d.id === id);
    const folderId = doc?.folderId ?? "";
    // FR-009: 같은 폴더 중복 제목 → 접미사(자기 자신 제외)
    const finalTitle = uniqueTitle(titlesInFolder(get().documents, folderId, id), title);
    await docsRepo.renameDocument(id, finalTitle);
    await refresh(set);
  },

  // M6: 활성/대상 문서의 소속 폴더 변경(저장 대상 지정). 중복 제목이면 접미사 재부여.
  moveDocument: async (id, folderId) => {
    const doc = get().documents.find((d) => d.id === id);
    if (!doc || doc.folderId === folderId) return;
    const finalTitle = uniqueTitle(titlesInFolder(get().documents, folderId, id), doc.title);
    await docsRepo.setFolder(id, folderId, finalTitle);
    await refresh(set);
  },

  deleteFolder: async (id) => {
    await foldersRepo.deleteFolder(id); // cascade
    await refresh(set);
    // 활성 문서가 삭제됐으면 다른 문서로 전환 또는 빈 버퍼(W6)
    const { documents, activeDocId } = get();
    if (activeDocId && !documents.some((d) => d.id === activeDocId)) {
      if (documents.length > 0) await get().selectDocument(documents[0].id);
      else {
        set({ activeDocId: null });
        useEditorStore.getState().setBuffer("");
      }
    }
  },

  deleteDocument: async (id) => {
    await docsRepo.deleteDocument(id);
    await refresh(set);
    if (get().activeDocId === id) {
      const { documents } = get();
      if (documents.length > 0) await get().selectDocument(documents[0].id);
      else {
        set({ activeDocId: null });
        useEditorStore.getState().setBuffer("");
      }
    }
  },

  selectDocument: async (id) => {
    const doc = await docsRepo.getDocument(id);
    if (!doc) return;
    set((s) => ({ activeDocId: id, expanded: new Set(s.expanded).add(doc.folderId) }));
    useEditorStore.getState().setBuffer(doc.content); // W1: 버퍼 주입
  },

  saveActive: async () => {
    const { activeDocId } = get();
    if (!activeDocId) return { ok: false, error: "활성 문서 없음" };
    try {
      await docsRepo.updateContent(activeDocId, useEditorStore.getState().doc);
      useEditorStore.getState().markSaved(); // W2
      await refresh(set); // updatedAt 갱신 반영
      return { ok: true };
    } catch (e) {
      // G1: 쓰기 실패(quota 등) — 데이터 무손상, 호출측 토스트
      return { ok: false, error: e instanceof Error ? e.message : "저장 실패" };
    }
  },

  toggleExpand: (folderId) =>
    set((s) => {
      const next = new Set(s.expanded);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return { expanded: next };
    }),
}));
