import { describe, it, expect, beforeEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { __resetDbHandle } from "@/lib/storage/db";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { listByFolder } from "@/lib/storage/documents";

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbHandle();
  localStorage.clear();
  useWorkspaceStore.setState({
    folders: [],
    documents: [],
    activeDocId: null,
    expanded: new Set(),
    loaded: false,
  });
});

const ws = () => useWorkspaceStore.getState();

describe("moveDocument + 중복 제목 (M6)", () => {
  it("문서를 다른 폴더로 이동·영속", async () => {
    await ws().loadAll();
    await ws().createFolder("A");
    await ws().createFolder("B");
    const fa = ws().folders.find((f) => f.name === "A")!.id;
    const fb = ws().folders.find((f) => f.name === "B")!.id;
    await ws().createDocument(fa);
    const docId = ws().activeDocId!;

    await ws().moveDocument(docId, fb);
    expect(await listByFolder(fa)).toHaveLength(0);
    expect(await listByFolder(fb)).toHaveLength(1);
  });

  it("같은 폴더 문서 2개 생성 → 제목 중복 접미사", async () => {
    await ws().loadAll();
    await ws().createFolder("F");
    const f = ws().folders.find((x) => x.name === "F")!.id;
    await ws().createDocument(f);
    await ws().createDocument(f);
    const titles = ws().documents.filter((d) => d.folderId === f).map((d) => d.title);
    expect(new Set(titles).size).toBe(titles.length); // 중복 없음
    expect(titles).toContain("제목 없음-1");
  });

  it("loadAll 멱등 — 두 번 호출해도 폴더·문서 중복 없음", async () => {
    await ws().loadAll();
    const f1 = ws().folders.length;
    await ws().loadAll();
    expect(ws().folders.length).toBe(f1);
  });
});
