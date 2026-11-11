import { describe, expect, test } from "bun:test"
import { applyImageFits } from "~/components/book-reader/book-reader"

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
