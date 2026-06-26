import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { loadDoc, saveDoc } from "@/lib/storage/local";
import { SEED_MARKDOWN } from "@/lib/constants/seed";

const KEY = "mdeditor:v1";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("storage local (S1–S6)", () => {
  it("S1 키 부재 → 시드", () => {
    const r = loadDoc();
    expect(r.isSeed).toBe(true);
    expect(r.content).toBe(SEED_MARKDOWN);
  });

  it("S2 키 존재(빈 문자열 포함) → 저장본 우선", () => {
    saveDoc("");
    const r = loadDoc();
    expect(r.isSeed).toBe(false);
    expect(r.content).toBe("");
  });

  it("S3 손상 데이터 → 시드 복구", () => {
    localStorage.setItem(KEY, "{not valid json");
    const r = loadDoc();
    expect(r.isSeed).toBe(true);
    expect(r.content).toBe(SEED_MARKDOWN);
  });

  it("S4·S6 저장 round-trip", () => {
    const res = saveDoc("# hello");
    expect(res.ok).toBe(true);
    expect(loadDoc().content).toBe("# hello");
  });

  it("S5 쓰기 실패(quota) → {ok:false,error}", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const res = saveDoc("x");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("Quota");
  });
});
