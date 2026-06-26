import { describe, it, expect, beforeEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { __resetDbHandle } from "@/lib/storage/db";
import { migrate } from "@/lib/storage/migrate";
import { listFolders } from "@/lib/storage/folders";
import { listAllMeta, getDocument } from "@/lib/storage/documents";

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbHandle();
  localStorage.clear();
});

describe("migrate (M1–M4 + C1 부활방지)", () => {
  it("M1 legacy content 있음 → '내 문서' 폴더 + 문서 1건(그 내용)", async () => {
    localStorage.setItem("mdeditor:v1", JSON.stringify({ content: "# 제목\n본문", updatedAt: 1 }));
    await migrate();
    const folders = await listFolders();
    expect(folders).toHaveLength(1);
    expect(folders[0].name).toBe("내 문서");
    const metas = await listAllMeta();
    expect(metas).toHaveLength(1);
    expect(metas[0].title).toBe("제목"); // 첫 H1
    const doc = await getDocument(metas[0].id);
    expect(doc!.content).toBe("# 제목\n본문");
  });

  it("M2 legacy 없음 → 기본 폴더 + 빈 문서 1건(U1)", async () => {
    await migrate();
    expect(await listFolders()).toHaveLength(1);
    const metas = await listAllMeta();
    expect(metas).toHaveLength(1);
    expect(metas[0].title).toBe("제목 없음");
  });

  it("M3 재실행 멱등 — 두 번 호출해도 폴더·문서 중복 없음", async () => {
    await migrate();
    await migrate();
    expect(await listFolders()).toHaveLength(1);
    expect(await listAllMeta()).toHaveLength(1);
  });

  it("C1 마지막 문서 삭제 후 재실행 → 부활/중복 폴더 없음(플래그 기반)", async () => {
    localStorage.setItem("mdeditor:v1", JSON.stringify({ content: "복원되면 안 됨" }));
    await migrate();
    // 사용자가 모든 문서 삭제했다고 가정
    const { deleteDocument } = await import("@/lib/storage/documents");
    for (const m of await listAllMeta()) await deleteDocument(m.id);
    expect(await listAllMeta()).toHaveLength(0);
    // 새로고침 = migrate 재호출
    await migrate();
    expect(await listAllMeta()).toHaveLength(0); // 부활 안 함
    expect(await listFolders()).toHaveLength(1); // 중복 폴더 없음
  });

  it("M4 손상된 legacy → 빈 문서로 안전 시작", async () => {
    localStorage.setItem("mdeditor:v1", "{깨진 json");
    await migrate();
    const metas = await listAllMeta();
    expect(metas).toHaveLength(1);
    expect(metas[0].title).toBe("제목 없음");
  });
});
