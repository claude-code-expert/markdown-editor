import { create } from "zustand";
import { loadDoc, saveDoc } from "@/lib/storage/local";

/** 활성 id 배열 동등성 — 불필요한 리렌더 방지 */
function sameIds(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

interface EditorStore {
  doc: string;
  savedDoc: string;
  dirty: boolean;
  initialized: boolean;
  activeIds: string[];
  inTable: boolean;
  setDoc: (next: string) => void;
  setActiveIds: (ids: string[]) => void;
  setInTable: (v: boolean) => void;
  init: () => void;
  save: () => { ok: boolean; error?: string };
  cancel: () => void;
}

/**
 * 전역 에디터 상태. dirty = doc !== savedDoc.
 * 저장/취소/이탈경고 3흐름이 이 상태쌍에서 파생(data-model.md).
 */
export const useEditorStore = create<EditorStore>((set, get) => ({
  doc: "",
  savedDoc: "",
  dirty: false,
  initialized: false,
  activeIds: [],
  inTable: false,
  setDoc: (next) => set((s) => ({ doc: next, dirty: next !== s.savedDoc })),
  setActiveIds: (ids) =>
    set((s) => (sameIds(s.activeIds, ids) ? s : { activeIds: ids })),
  setInTable: (v) => set((s) => (s.inTable === v ? s : { inTable: v })),
  init: () => {
    const { content } = loadDoc();
    set({ doc: content, savedDoc: content, dirty: false, initialized: true });
  },
  save: () => {
    const res = saveDoc(get().doc);
    if (res.ok) set((s) => ({ savedDoc: s.doc, dirty: false }));
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  },
  cancel: () => set((s) => ({ doc: s.savedDoc, dirty: false })),
}));
