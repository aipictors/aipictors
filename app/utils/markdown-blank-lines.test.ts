import { describe, expect, test } from "bun:test"
import { Editor } from "@tiptap/core"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import { createWorkMarkdownExtensions } from "~/components/book-reader/work-markdown-extensions"
import { keepMarkdownIndent } from "~/utils/keep-markdown-indent"
import {
  BlankLineParagraph,
  restoreBlankLines,
} from "~/utils/markdown-blank-lines"
import { repairMarkdownHardBreaks } from "~/utils/repair-markdown-hard-breaks"

/** 入力欄（text-editor と同じ拡張） */
const createEditor = (content: string) =>
  new Editor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      BlankLineParagraph,
      Markdown,
      Image.configure({ inline: true }),
    ],
    content,
  })

const save = (editor: Editor) =>
  repairMarkdownHardBreaks(editor.storage.markdown.getMarkdown())

const load = (md: string) =>
  createEditor(
    restoreBlankLines(keepMarkdownIndent(repairMarkdownHardBreaks(md))),
  )

describe("本文の空行", () => {
  test("空行は保存しても消えず、何度保存しても増えない", () => {
    const md = save(createEditor("<p>あ</p><p></p><p></p><p>い</p>"))
    expect(md).toBe("あ\n\n&nbsp;\n\n&nbsp;\n\nい")
    const reloaded = load(md)
    expect(reloaded.getHTML()).toBe("<p>あ</p><p></p><p></p><p>い</p>")
    expect(save(load(save(reloaded)))).toBe(md)
  })

  test("改行（Shift+Enter）と空行が混ざっても変わらない", () => {
    const md = save(createEditor("<p>あ<br>い</p><p></p><p>う</p>"))
    expect(load(md).getHTML()).toBe("<p>あ<br>い</p><p></p><p>う</p>")
  })

  test("最初と最後の空行は書き出さない（何も書いていない本文は空のまま）", () => {
    expect(save(createEditor(""))).toBe("")
    expect(save(createEditor("<p></p><p></p>"))).toBe("")
    expect(save(createEditor("<p></p><p>あ</p><p></p>"))).toBe("あ")
  })

  test("作品ページでは 1 行の空行として出る", () => {
    const md = save(createEditor("<p>あ</p><p></p><p>い</p>"))
    const html = new Editor({
      editable: false,
      extensions: createWorkMarkdownExtensions(),
      content: keepMarkdownIndent(repairMarkdownHardBreaks(md)),
    }).getHTML()
    expect(html).toBe("<p>あ</p><p>&nbsp;</p><p>い</p>")
  })
})
