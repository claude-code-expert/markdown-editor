import { describe, it, expect, beforeEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { __resetDbHandle } from "@/lib/storage/db";
import { createFolder } from "@/lib/storage/folders";
import {
  createDocument,
  getDocument,
  updateContent,
  renameDocument,
  deleteDocument,
  listByFolder,
  listAllMeta,
} from "@/lib/storage/documents";

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbHandle();
});

describe("documents 리포지토리 (D2·D3·D5·D6)", () => {
  it("D2 createDocument 기본 title '제목 없음'", async () => {
    const f = await createFolder("F");
    const d = await createDocument(f.id);
    expect(d.title).toBe("제목 없음");
    expect((await listByFolder(f.id))).toHaveLength(1);
  });

  it("D3 updateContent → content 일치, updatedAt 증가", async () => {
    const f = await createFolder("F");
    const d = await createDocument(f.id);
    const before = (await getDocument(d.id))!.updatedAt;
    await updateContent(d.id, "# 안녕");
    const after = await getDocument(d.id);
    expect(after!.content).toBe("# 안녕");
    expect(after!.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it("D5 deleteDocument → 해당만 삭제, 타 문서 영향 0", async () => {
    const f = await createFolder("F");
    const a = await createDocument(f.id);
    const b = await createDocument(f.id);
    await deleteDocument(a.id);
    expect(await getDocument(a.id)).toBeUndefined();
    expect(await getDocument(b.id)).toBeTruthy();
  });

  it("D6 by-folder 인덱스 폴더별 조회", async () => {
    const f1 = await createFolder("F1");
    const f2 = await createFolder("F2");
    await createDocument(f1.id);
    await createDocument(f2.id);
    expect(await listByFolder(f1.id)).toHaveLength(1);
    expect(await listAllMeta()).toHaveLength(2);
  });

  it("renameDocument 반영", async () => {
    const f = await createFolder("F");
    const d = await createDocument(f.id);
    await renameDocument(d.id, "새 제목");
    expect((await getDocument(d.id))!.title).toBe("새 제목");
  });

  it("listAllMeta는 content를 제외한다", async () => {
    const f = await createFolder("F");
    const d = await createDocument(f.id);
    await updateContent(d.id, "본문");
    const meta = await listAllMeta();
    expect("content" in meta[0]).toBe(false);
  });
});
