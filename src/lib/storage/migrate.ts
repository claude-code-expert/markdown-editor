import { getDB } from "./db";
import { createFolder } from "./folders";
import { createDocument, updateContent } from "./documents";

const LEGACY_KEY = "mdeditor:v1";
const FLAG = "migrated";

/**
 * 1회 마이그레이션 (C1: 문서 수가 아닌 영속 플래그로 멱등성 보장 → 마지막 문서 삭제 후
 * 새로고침 시 부활 방지). U1: 신규 설치도 기본 폴더 + 빈 문서 1건을 항상 시드.
 *  - 플래그 있으면 즉시 종료(멱등)
 *  - "내 문서" 기본 폴더 생성
 *  - localStorage mdeditor:v1 content 있으면 그 내용으로 문서, 없으면 빈 "제목 없음" 문서
 */
export async function migrate(): Promise<void> {
  const db = await getDB();
  if (await db.get("meta", FLAG)) return; // C1: 플래그 기반 멱등

  const folder = await createFolder("내 문서");

  let content = "";
  let title = "제목 없음";
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { content?: unknown };
      if (typeof parsed?.content === "string") {
        content = parsed.content;
        const h = content.match(/^#\s+(.+)$/m);
        if (h) title = h[1].trim().slice(0, 40);
      }
    }
  } catch {
    // 손상된 legacy → 빈 문서로 안전 시작(M4)
  }

  const doc = await createDocument(folder.id, title); // U1: 항상 1건 시드
  if (content) await updateContent(doc.id, content);

  await db.put("meta", true, FLAG); // 플래그 설정
}
