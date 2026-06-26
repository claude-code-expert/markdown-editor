import { create } from "zustand";
import type { Folder, DocumentMeta } from "@/lib/storage/db";
import * as foldersRepo from "@/lib/storage/folders";
import * as docsRepo from "@/lib/storage/documents";
import { migrate } from "@/lib/storage/migrate";
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
  selectDocument: (id: string) => Promise<void>;
  saveActive: () => Promise<{ ok: boolean; error?: string }>;
  toggleExpand: (folderId: string) => void;
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
    await migrate(); // C1: 멱등(플래그 기반), U1: 빈 문서 1건 시드 보장
    await refresh(set);
    set({ loaded: true });
    const { documents, activeDocId } = get();
    if (!activeDocId && documents.length > 0) {
      await get().selectDocument(documents[0].id);
    }
  },

  createFolder: async (name) => {
    const f = await foldersRepo.createFolder(name);
    await refresh(set);
    set((s) => ({ expanded: new Set(s.expanded).add(f.id) }));
  },

  createDocument: async (folderId) => {
    const d = await docsRepo.createDocument(folderId);
    await refresh(set);
    set((s) => ({ expanded: new Set(s.expanded).add(folderId) }));
    await get().selectDocument(d.id);
  },

  renameFolder: async (id, name) => {
    await foldersRepo.renameFolder(id, name);
    await refresh(set);
  },

  renameDocument: async (id, title) => {
    await docsRepo.renameDocument(id, title);
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
