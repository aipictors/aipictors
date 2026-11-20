import { describe, expect, test } from "bun:test"
import { Editor } from "@tiptap/core"
import Image from "@tiptap/extension-image"
import StarterKit from "@tiptap/starter-kit"
import { Markdown } from "tiptap-markdown"
import { repairMarkdownHardBreaks } from "~/utils/repair-markdown-hard-breaks"

const createEditor = (content: string) =>
  new Editor({
    extensions: [StarterKit, Markdown, Image.configure({ inline: true })],
    content,
  })

/** 入力欄で保存して、もう一度読み込んだときの本文 */
const saveAndReload = (html: string) => {
  const md = repairMarkdownHardBreaks(
    createEditor(html).storage.markdown.getMarkdown(),
  )
  return createEditor(repairMarkdownHardBreaks(md)).getText()
}

describe("repairMarkdownHardBreaks", () => {
  test("改行のあとが空白だけで段落が終わっても「\\」が出ない", () => {
    expect(saveAndReload("<p>あ<br>&nbsp;</p><p>い</p>")).not.toContain("\\")
    expect(saveAndReload("<p>あ<br>　</p>")).not.toContain("\\")
  })

  test("見出しの中の改行でも「\\」が出ない", () => {
    expect(saveAndReload("<h1>題<br>副題</h1><p>本文</p>")).not.toContain("\\")
  })

  test("保存済みの本文の印も表示の前に直す", () => {
    expect(repairMarkdownHardBreaks("あ\\\n　\n\nい")).toBe("あ\n\n\nい")
    expect(repairMarkdownHardBreaks("あ\\\n \n")).toBe("あ\n\n")
    expect(repairMarkdownHardBreaks("# 題\\\n副題")).toBe("# 題\n副題")
  })

  test("改行のあとの「---」だけの行で、段落全体が見出しにならない", () => {
    const reload = (md: string) =>
      createEditor(repairMarkdownHardBreaks(md)).getJSON().content ?? []

    // 改行（\）でつないだ段落の中に「---」を書いたもの
    const saved = reload("あ\\\nい\\\n---\\\nう")
    expect(saved.map((node) => node.type)).toEqual(["paragraph"])
    expect(saveAndReload("<p>あ<br>い<br>---</p><p>う</p>")).toBe(
      "あ\nい\n---\n\nう",
    )
    expect(saveAndReload("<p>あ<br>===</p>")).toBe("あ\n===")
    // 行末の空白 2 つの改行でも同じ
    expect(
      reload("あ  \nい  \n---  \n\nう").map((node) => node.type),
    ).toEqual(["paragraph", "paragraph"])
    // 何度保存しても「\」が増えない
    const once = repairMarkdownHardBreaks(
      createEditor("<p>あ<br>---</p>").storage.markdown.getMarkdown(),
    )
    const twice = repairMarkdownHardBreaks(
      createEditor(once).storage.markdown.getMarkdown(),
    )
    expect(twice).toBe(once)
  })

  test("空行のあと・見出しのあとの「---」は区切り線のまま", () => {
    expect(repairMarkdownHardBreaks("あ  \n  \n---  \n  \nい")).toBe(
      "あ  \n  \n---  \n  \nい",
    )
    expect(repairMarkdownHardBreaks("## 題  \n---")).toBe("## 題  \n---")
    expect(repairMarkdownHardBreaks("あ\n---")).toBe("あ\n---")
  })

  test("ふつうの改行・文字の「\\」・コードブロックは変えない", () => {
    expect(repairMarkdownHardBreaks("あ\\\nい")).toBe("あ\\\nい")
    expect(repairMarkdownHardBreaks("あ\\\\\n\nい")).toBe("あ\\\\\n\nい")
    expect(repairMarkdownHardBreaks("```\na\\\n \n```")).toBe("```\na\\\n \n```")
    expect(saveAndReload("<p>あ<br>い</p>")).toBe("あ\nい")
  })
})
