import { Link as LinkIcon } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { buildDialogInsert } from "./helpers";

export const link: MarkdownPlugin = {
  id: "link",
  label: "링크",
  icon: LinkIcon,
  group: "inline",
  dialog: { fields: [{ key: "url", label: "URL", placeholder: "https://" }] },
  apply: (s, inputs) =>
    buildDialogInsert(
      s,
      (text, url) => `[${text}](${url})`,
      "링크 텍스트",
      inputs?.url ?? "",
    ),
};
