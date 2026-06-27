import { describe, it, expect, beforeEach } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { __resetDbHandle } from "@/lib/storage/db";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { useEditorStore } from "@/lib/store/useEditorStore";

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
  __resetDbHandle();
  localStorage.clear();
  // 스토어 상태 초기화
  useWorkspaceStore.setState({
    folders: [],
    documents: [],
    activeDocId: null,
    expanded: new Set(),
    loaded: false,
  });
  useEditorStore.getState().setBuffer("");
});

const ws = () => useWorkspaceStore.getState();
const ed = () => useEditorStore.getState();

describe("워크스페이스 협응 (W1–W6)", () => {
  it("loadAll → 이관(기본 폴더+빈 문서) + 첫 문서 활성", async () => {
    await ws().loadAll();
    expect(ws().folders).toHaveLength(1);
    expect(ws().documents).toHaveLength(1);
    // M6: loadAll은 활성 문서를 자동선택하지 않는다(URL이 단일 출처). 선택 시 활성화.
    expect(ws().activeDocId).toBeNull();
    await ws().selectDocument(ws().documents[0].id);
    expect(ws().activeDocId).toBe(ws().documents[0].id);
  });

  it("W1 selectDocument → 에디터 버퍼 주입(savedDoc=doc, dirty=false)", async () => {
    await ws().loadAll();
    const folderId = ws().folders[0].id;
    await ws().createDocument(folderId);
    const id = ws().documents.find((d) => d.id === ws().activeDocId)!.id;
    ed().setDoc("편집됨");
    await ws().selectDocument(id);
    expect(ed().dirty).toBe(false);
  });

  it("W2 saveActive → 활성 문서에 기록, dirty 해제", async () => {
    await ws().loadAll();
    await ws().selectDocument(ws().documents[0].id); // M6: 활성 문서 선택
    ed().setDoc("# 저장할 내용");
    expect(ed().dirty).toBe(true);
    const res = await ws().saveActive();
    expect(res.ok).toBe(true);
    expect(ed().dirty).toBe(false);
  });

  it("W4 A→B→A 전환 시 내용 무혼합 (SC-005)", async () => {
    await ws().loadAll();
    await ws().selectDocument(ws().documents[0].id); // M6: 활성 문서 선택
    const folderId = ws().folders[0].id;
    const docA = ws().activeDocId!;
    ed().setDoc("내용 A");
    await ws().saveActive();

    await ws().createDocument(folderId);
    const docB = ws().activeDocId!;
    expect(docB).not.toBe(docA);
    ed().setDoc("내용 B");
    await ws().saveActive();

    await ws().selectDocument(docA);
    expect(ed().doc).toBe("내용 A");
    await ws().selectDocument(docB);
    expect(ed().doc).toBe("내용 B");
  });

  it("W5 createFolder/createDocument → 목록 갱신", async () => {
    await ws().loadAll();
    await ws().createFolder("새 폴더");
    expect(ws().folders.length).toBeGreaterThanOrEqual(2);
  });

  it("W6 활성 문서 삭제 → 다른 문서 전환 또는 빈 버퍼", async () => {
    await ws().loadAll();
    const folderId = ws().folders[0].id;
    await ws().createDocument(folderId); // 문서 2개
    const active = ws().activeDocId!;
    await ws().deleteDocument(active);
    expect(ws().documents.some((d) => d.id === active)).toBe(false);
    // 활성은 남은 문서이거나 null
    if (ws().documents.length > 0) expect(ws().activeDocId).toBeTruthy();
    else expect(ws().activeDocId).toBeNull();
  });
});
