import Blockquote from "@tiptap/extension-blockquote"
import CodeBlock from "@tiptap/extension-code-block"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import { HidePageBreakMarkers } from "~/components/book-reader/hide-page-break-markers"

/**
 * 小説・コラムの本文（Markdown）を読むときの tiptap の拡張。
 * 作品ページの本文と「本のように読む」だけの画面で同じ HTML になるように、ここにまとめる
 */
export const createWorkMarkdownExtensions = () => [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal pl-4",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc pl-4",
      },
    },
  }),
  Markdown,
  Image.configure({
    inline: true,
    allowBase64: true,
  }),
  CodeBlock.configure({
    HTMLAttributes: {
      class: "bg-gray-800 text-white text-sm p-2 rounded-md",
      languageClassPrefix: "language-",
    },
  }),
  Blockquote,
  HorizontalRule,
  // 「[改ページ]」は本のように読む画面のための印なので、作品ページでは出さない
  HidePageBreakMarkers,
]
