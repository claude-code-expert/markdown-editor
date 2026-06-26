import { getDB, type Document, type DocumentMeta } from "./db";

const stripContent = ({ content: _c, ...meta }: Document): DocumentMeta => meta;

export async function listAllMeta(): Promise<DocumentMeta[]> {
  const all = await (await getDB()).getAll("documents");
  return all.sort((a, b) => a.createdAt - b.createdAt).map(stripContent);
}

export async function listByFolder(folderId: string): Promise<DocumentMeta[]> {
  const docs = await (await getDB()).getAllFromIndex(
    "documents",
    "by-folder",
    folderId,
  );
  return docs.sort((a, b) => a.createdAt - b.createdAt).map(stripContent);
}

export async function getDocument(id: string): Promise<Document | undefined> {
  return (await getDB()).get("documents", id);
}

export async function createDocument(
  folderId: string,
  title = "제목 없음",
): Promise<Document> {
  const now = Date.now();
  const doc: Document = {
    id: crypto.randomUUID(),
    folderId,
    title,
    content: "",
    createdAt: now,
    updatedAt: now,
  };
  await (await getDB()).put("documents", doc);
  return doc;
}

/** 활성 문서 내용 기록 (W2). 쓰기 실패(quota 등)는 호출측에서 처리(G1). */
export async function updateContent(id: string, content: string): Promise<void> {
  const db = await getDB();
  const doc = await db.get("documents", id);
  if (!doc) throw new Error("문서를 찾을 수 없습니다");
  doc.content = content;
  doc.updatedAt = Date.now();
  await db.put("documents", doc);
}

export async function renameDocument(id: string, title: string): Promise<void> {
  const db = await getDB();
  const doc = await db.get("documents", id);
  if (!doc) return;
  doc.title = title.trim() || doc.title;
  doc.updatedAt = Date.now();
  await db.put("documents", doc);
}

export async function deleteDocument(id: string): Promise<void> {
  await (await getDB()).delete("documents", id);
}
