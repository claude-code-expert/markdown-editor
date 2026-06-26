import { describe, it, expect } from "vitest";
import {
  isInTable,
  addRow,
  addColumn,
  setColumnAlign,
  currentColumn,
} from "@/lib/markdown/tableOps";

const T = "| a | b |\n| --- | --- |\n| 1 | 2 |";
const cellsPerRow = (doc: string) =>
  doc.split("\n").map((l) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").length);

describe("tableOps (T1–T6)", () => {
  it("T1 isInTable: 표 안 true / 밖 false", () => {
    expect(isInTable(T, 2)).toBe(true);
    expect(isInTable("hello world", 3)).toBe(false);
  });

  it("T2 addRow: 헤더 셀 수와 같은 새 행 추가", () => {
    const r = addRow(T, 2);
    const lines = r.doc.split("\n");
    expect(lines).toHaveLength(4);
    expect(lines[3].split("|").filter((s) => s.trim() === "" || s.trim()).length).toBeGreaterThan(0);
    expect(cellsPerRow(r.doc).every((n) => n === 2)).toBe(true);
  });

  it("T3 addColumn: 모든 행 +1 셀", () => {
    const r = addColumn(T, 2);
    expect(cellsPerRow(r.doc).every((n) => n === 3)).toBe(true);
  });

  it("T4 setColumnAlign: 구분선 셀 → :---:", () => {
    const r = setColumnAlign(T, 2, 0, "center");
    expect(r.doc.split("\n")[1]).toContain(":---:");
  });

  it("T5 표 밖 → no-op", () => {
    const doc = "no table here";
    expect(addRow(doc, 2).doc).toBe(doc);
    expect(addColumn(doc, 2).doc).toBe(doc);
  });

  it("T6 불변식: 조작 후 모든 행 셀 수 동일", () => {
    const r = addColumn(T, 2);
    const counts = cellsPerRow(r.doc);
    expect(new Set(counts).size).toBe(1);
  });

  it("currentColumn: 커서 열 인덱스", () => {
    expect(currentColumn(T, 2)).toBe(0); // 첫 셀 'a' 근처
  });
});
