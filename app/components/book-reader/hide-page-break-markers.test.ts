import { describe, expect, test } from "bun:test"
import { Editor } from "@tiptap/core"
import { createWorkMarkdownExtensions } from "~/components/book-reader/work-markdown-extensions"

const render = (markdown: string) => {
  const element = document.createElement("div")
  const editor = new Editor({
    element,
    extensions: createWorkMarkdownExtensions(),
    content: markdown,
    editable: false,
  })
  const paragraphs = Array.from(element.querySelectorAll("p")).map(
    (paragraph) => ({
      hidden: paragraph.style.display === "none",
      images: paragraph.querySelectorAll("img").length,
    }),
  )
  editor.destroy()
  return paragraphs
}

describe("HidePageBreakMarkers", () => {
  test("［改ページ］だけの段落は隠す", () => {
    expect(render("一\n\n［改ページ］\n\n二")).toEqual([
      { hidden: false, images: 0 },
      { hidden: true, images: 0 },
      { hidden: false, images: 0 },
    ])
  })

  test("挿絵と［改ページ］だけの段落は、挿絵が見えるように段落を隠さない", () => {
    expect(
      render(
        "![](https://a.example/a.png)![](https://a.example/b.png)［改ページ］",
      ),
    ).toEqual([{ hidden: false, images: 2 }])
  })
})
