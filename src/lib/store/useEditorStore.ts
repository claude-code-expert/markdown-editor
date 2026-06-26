import { create } from "zustand";

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
  /** 활성 문서 로드 — 버퍼 주입(savedDoc=doc=content, dirty=false) (M3 W1) */
  setBuffer: (content: string) => void;
  /** 저장 성공 후 — savedDoc=doc, dirty=false (워크스페이스 saveActive가 호출) */
  markSaved: () => void;
  cancel: () => void;
}

/**
 * 에디터 편집 버퍼 — "현재 활성 문서"만 안다(단일 책임). 폴더/문서 목록·영속은 워크스페이스 스토어.
 * dirty = doc !== savedDoc.
 */
export const useEditorStore = create<EditorStore>((set) => ({
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
  setBuffer: (content) =>
    set({ doc: content, savedDoc: content, dirty: false, initialized: true }),
  markSaved: () => set((s) => ({ savedDoc: s.doc, dirty: false })),
  cancel: () => set((s) => ({ doc: s.savedDoc, dirty: false })),
}));
