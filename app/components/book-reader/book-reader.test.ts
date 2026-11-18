import { describe, expect, test } from "bun:test"
import {
  applyImageFits,
  isSelectingInside,
} from "~/components/book-reader/book-reader"

describe("applyImageFits", () => {
  const html =
    '<p data-b="0">本文</p><p data-b="1"><img src="a.png"></p><p data-b="2"><img src="b.png"></p>'

  test("何も指定しなければそのまま返す", () => {
    expect(applyImageFits(html, {}, {})).toBe(html)
  })

  test("次の画面へ送る挿絵は、段落の前に数だけ改ページの印を入れる", () => {
    const result = applyImageFits(html, {}, { 1: 2 })
    expect(result).toBe(
      '<p data-b="0">本文</p><p data-b="1"><img src="a.png"></p>' +
        '<div class="rb-view-break" aria-hidden="true"></div>' +
        '<div class="rb-view-break" aria-hidden="true"></div>' +
        '<p data-b="2"><img src="b.png"></p>',
    )
  })

  test("縮める挿絵には大きさを書き込む", () => {
    expect(applyImageFits(html, { 0: 200 }, {})).toContain(
      '<img src="a.png" style="max-block-size: 200px">',
    )
  })
})

describe("isSelectingInside", () => {
  const setup = () => {
    document.body.innerHTML =
      '<div id="editor">編集中の本文</div><div id="reader"><p>本の本文</p></div>'
    const editor = document.getElementById("editor") as HTMLElement
    const reader = document.getElementById("reader") as HTMLElement
    return { editor, reader }
  }

  const select = (node: Node) => {
    const selection = window.getSelection() as Selection
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.removeAllRanges()
    selection.addRange(range)
    return selection
  }

  test("編集画面に文字の選択が残っていても、本の画面のタップは止めない", () => {
    const { editor, reader } = setup()
    expect(isSelectingInside(reader, select(editor))).toBe(false)
  })

  test("本の画面の中で文字を選んでいるときだけ止める", () => {
    const { reader } = setup()
    expect(isSelectingInside(reader, select(reader))).toBe(true)
  })

  test("選択が無ければ止めない", () => {
    const { reader } = setup()
    const selection = window.getSelection() as Selection
    selection.removeAllRanges()
    expect(isSelectingInside(reader, selection)).toBe(false)
    expect(isSelectingInside(null, selection)).toBe(false)
  })
})
