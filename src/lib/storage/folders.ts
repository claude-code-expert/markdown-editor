import { getDB, type Folder } from "./db";

export async function listFolders(): Promise<Folder[]> {
  const all = await (await getDB()).getAll("folders");
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function createFolder(name: string): Promise<Folder> {
  const folder: Folder = {
    id: crypto.randomUUID(),
    name: name.trim() || "새 폴더",
    parentId: null,
    createdAt: Date.now(),
  };
  await (await getDB()).put("folders", folder);
  return folder;
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const db = await getDB();
  const folder = await db.get("folders", id);
  if (!folder) return;
  folder.name = name.trim() || folder.name;
  await db.put("folders", folder);
}

/** 폴더 삭제 — 하위 문서 cascade (D4·R7). 단일 트랜잭션으로 정합성 보장. */
export async function deleteFolder(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["folders", "documents"], "readwrite");
  const docKeys = await tx
    .objectStore("documents")
    .index("by-folder")
    .getAllKeys(id);
  for (const key of docKeys) await tx.objectStore("documents").delete(key);
  await tx.objectStore("folders").delete(id);
  await tx.done;
}
