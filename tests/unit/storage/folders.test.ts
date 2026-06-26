import { describe, it, expect, beforeEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { __resetDbHandle } from "@/lib/storage/db";
import { listFolders, createFolder, renameFolder, deleteFolder } from "@/lib/storage/folders";
import { createDocument, listByFolder } from "@/lib/storage/documents";

beforeEach(() => {
  // 각 테스트 격리 — 새 IndexedDB + DB 핸들 리셋
  globalThis.indexedDB = new IDBFactory();
  __resetDbHandle();
});

describe("folders 리포지토리 (D1·D4)", () => {
  it("D1 createFolder → listFolders 1건, id·createdAt 부여", async () => {
    const f = await createFolder("폴더A");
    expect(f.id).toBeTruthy();
    expect(f.createdAt).toBeGreaterThan(0);
    const list = await listFolders();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("폴더A");
  });

  it("renameFolder 반영", async () => {
    const f = await createFolder("이전");
    await renameFolder(f.id, "이후");
    expect((await listFolders())[0].name).toBe("이후");
  });

  it("D4 deleteFolder → 하위 문서 cascade", async () => {
    const f = await createFolder("폴더");
    await createDocument(f.id);
    await createDocument(f.id);
    expect(await listByFolder(f.id)).toHaveLength(2);
    await deleteFolder(f.id);
    expect(await listFolders()).toHaveLength(0);
    expect(await listByFolder(f.id)).toHaveLength(0);
  });
});
