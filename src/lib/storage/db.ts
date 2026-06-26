import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/** 영속 엔티티 (requirement.md §5–6, contracts/storage-db.md) */
export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // M3는 항상 null(평면)
  createdAt: number;
}
export interface Document {
  id: string;
  folderId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
export type DocumentMeta = Omit<Document, "content">;

interface MdSchema extends DBSchema {
  folders: { key: string; value: Folder };
  documents: { key: string; value: Document; indexes: { "by-folder": string } };
  meta: { key: string; value: unknown }; // 마이그레이션 플래그 등(C1)
}

let dbPromise: Promise<IDBPDatabase<MdSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<MdSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<MdSchema>("mdeditor", 1, {
      upgrade(db) {
        db.createObjectStore("folders", { keyPath: "id" });
        const docs = db.createObjectStore("documents", { keyPath: "id" });
        docs.createIndex("by-folder", "folderId");
        db.createObjectStore("meta");
      },
    });
  }
  return dbPromise;
}

/** 테스트 전용 — DB 핸들 캐시 리셋(fake-indexeddb 재생성과 함께 사용). */
export function __resetDbHandle(): void {
  dbPromise = null;
}
