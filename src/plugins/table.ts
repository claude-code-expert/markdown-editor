import { Table } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { insertBlock } from "./helpers";

// GFM 확장 — remark-gfm 필요
const TEMPLATE = ["| 헤더 | 헤더 |", "| --- | --- |", "| 셀 | 셀 |"].join("\n");

export const table: MarkdownPlugin = {
  id: "table",
  label: "표",
  icon: Table,
  group: "block",
  apply: (s) => insertBlock(s, TEMPLATE),
};
