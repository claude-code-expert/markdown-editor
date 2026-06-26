import { SEED_MARKDOWN } from "@/lib/constants/seed";

const KEY = "mdeditor:v1";

export interface StoredDoc {
  content: string;
  updatedAt: number;
}

/**
 * 로드 규칙:
 *  - 키 부재 → 시드(FR-018), isSeed=true
 *  - 키 존재(빈 문자열 포함) → 저장본 우선(FR-013), isSeed=false
 *  - 파싱 실패/손상 → 시드로 안전 복구(엣지)
 */
export function loadDoc(): { content: string; isSeed: boolean } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) return { content: SEED_MARKDOWN, isSeed: true };
    const parsed = JSON.parse(raw) as Partial<StoredDoc>;
    if (typeof parsed?.content !== "string") {
      return { content: SEED_MARKDOWN, isSeed: true };
    }
    return { content: parsed.content, isSeed: false };
  } catch {
    return { content: SEED_MARKDOWN, isSeed: true };
  }
}

/** 저장. 성공 시 {ok:true}, quota/쓰기 실패 시 {ok:false,error}(FR-012 토스트 근거). */
export function saveDoc(
  content: string,
): { ok: true } | { ok: false; error: string } {
  try {
    const payload: StoredDoc = { content, updatedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(payload));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "저장 실패" };
  }
}
