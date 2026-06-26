import { Bookmark } from "lucide-react";
import type { MarkdownPlugin } from "./types";
import { appendReferenceDef } from "./helpers";

/**
 * 참조 링크 — 본문에 [텍스트][id] 삽입 + 문서 하단에 [id]: url 정의 자동 수집.
 * 동일 id 정의가 있으면 재사용(중복 추가 없음). 전체 doc을 다루는 순수 함수.
 * contracts/reference-link.md (R1–R6).
 */
export const referenceLink: MarkdownPlugin = {
  id: "reference-link",
  label: "참조 링크",
  icon: Bookmark,
  group: "inline",
  dialog: {
    fields: [
      { key: "id", label: "식별자", placeholder: "ref1" },
      { key: "url", label: "URL", placeholder: "https://" },
    ],
  },
  apply: (s, inputs) => {
    const id = inputs?.id ?? "ref";
    const url = inputs?.url ?? "";
    const { doc, selectionStart, selectionEnd } = s;
    const text = doc.slice(selectionStart, selectionEnd) || "링크 텍스트";
    const md = `[${text}][${id}]`;
    const bodyDoc = doc.slice(0, selectionStart) + md + doc.slice(selectionEnd);
    const caret = selectionStart + md.length;
    const finalDoc = appendReferenceDef(bodyDoc, id, url);
    return { doc: finalDoc, selectionStart: caret, selectionEnd: caret };
  },
};
