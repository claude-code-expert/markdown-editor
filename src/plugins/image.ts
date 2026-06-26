import { Image as ImageIcon } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { buildDialogInsert } from "./helpers";

export const image: MarkdownPlugin = {
  id: "image",
  label: "이미지",
  icon: ImageIcon,
  group: "inline",
  dialog: { fields: [{ key: "url", label: "이미지 URL", placeholder: "https://" }] },
  apply: (s, inputs) =>
    buildDialogInsert(
      s,
      (text, url) => `![${text}](${url})`,
      "대체 텍스트",
      inputs?.url ?? "",
    ),
};
