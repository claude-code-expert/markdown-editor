import { ListChecks } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { toggleLinePrefix, linePrefixActive } from "./helpers";

/**
 * 작업목록(체크리스트) — GFM 확장. `- [ ] ` 접두 토글.
 * 활성 판정은 미체크(`- [ ] `)·체크(`- [x] `) 모두 인정해야 하므로 헬퍼를 직접 쓰지 않고 양쪽을 검사.
 */
export const taskList: MarkdownPlugin = {
  id: "task-list",
  label: "작업목록",
  icon: ListChecks,
  group: "list",
  apply: (s) => toggleLinePrefix(s, "- [ ] "),
  isActive: (s) =>
    linePrefixActive(s, "- [ ] ") || linePrefixActive(s, "- [x] "),
};
