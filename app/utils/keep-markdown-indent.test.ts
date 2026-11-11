import { describe, expect, test } from "bun:test"
import { Editor } from "@tiptap/core"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import { keepMarkdownIndent } from "~/utils/keep-markdown-indent"
import { repairMarkdownHardBreaks } from "~/utils/repair-markdown-hard-breaks"

const createEditor = (content: string) =>
  new Editor({
    extensions: [StarterKit, Markdown, Image.configure({ inline: true })],
    content,
  })

/** 入力欄と同じ手順で読み込む */
const load = (md: string) =>
  createEditor(keepMarkdownIndent(repairMarkdownHardBreaks(md)))

/** 入力欄で保存して、もう一度読み込んだときの本文 */
const saveAndReload = (html: string) => {
  const md = repairMarkdownHardBreaks(
    createEditor(html).storage.markdown.getMarkdown(),
  )
  return load(md)
}

describe("keepMarkdownIndent", () => {
  test("そのまま読み込むと段落の先頭の字下げが消える（直す前の動き）", () => {
    expect(createEditor("　あ\n\n　い").getText()).toBe("あ\n\nい")
  })

  test("保存して読み込み直しても段落の先頭の字下げが残る", () => {
    const editor = saveAndReload("<p>　あいう</p><p>　　えお</p>")
    expect(editor.getHTML()).toBe("<p>　あいう</p><p>　　えお</p>")
    // 保存する本文は全角スペースのまま
    expect(editor.storage.markdown.getMarkdown()).toBe("　あいう\n\n　　えお")
  })

  test("段落の中の改行のあと・引用・箇条書きの字下げも残る", () => {
    expect(saveAndReload("<p>　あ<br>　い</p>").getHTML()).toBe(
      "<p>　あ<br>　い</p>",
    )
    expect(load("> 　あ").getHTML()).toBe(
      "<blockquote><p>　あ</p></blockquote>",
    )
    expect(load("- 　あ").getHTML()).toContain("<p>　あ</p>")
  })

  test("保存済みの本文の字下げも表示の前に直す", () => {
    expect(keepMarkdownIndent("　あ\n\n　　い")).toBe(
      "&#x3000;あ\n\n&#x3000;&#x3000;い",
    )
    expect(load("あ\n\n　い").getText()).toBe("あ\n\n　い")
  })

  test("文の途中の全角スペース・半角スペース・コードブロックは変えない", () => {
    expect(keepMarkdownIndent("あ　い")).toBe("あ　い")
    expect(keepMarkdownIndent("    あ")).toBe("    あ")
    expect(keepMarkdownIndent("```\n　あ\n```")).toBe("```\n　あ\n```")
  })
})
