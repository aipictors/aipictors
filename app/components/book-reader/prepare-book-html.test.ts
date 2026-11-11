import { describe, expect, test } from "bun:test"
import { prepareBookHtml } from "~/components/book-reader/prepare-book-html"

describe("prepareBookHtml", () => {
  test("段落に通し番号を振り、空の段落に印を付け、最後の空行は消す", () => {
    const book = prepareBookHtml(
      "<p>一行目</p><p></p><p>二行目</p><p><br></p><p></p>",
    )
    expect(book.blockCount).toBe(3)
    expect(book.html).toBe(
      '<p data-b="0">一行目</p><p data-b="1" class="rb-blank"></p><p data-b="2">二行目</p>',
    )
    expect(book.charCount).toBe(6)
    expect(book.blockCharOffsets).toEqual([0, 3, 3])
  })

  test("縦棒つきの《》だけをルビにし、《《》》は傍点にする", () => {
    const book = prepareBookHtml(
      "<p>|魔法《まほう》と｜剣《つるぎ》、輸送船《エルシオン》、《《本当に》》</p>",
    )
    expect(book.html).toContain("<ruby>魔法<rt>まほう</rt></ruby>")
    expect(book.html).toContain("<ruby>剣<rt>つるぎ</rt></ruby>")
    expect(book.html).toContain("輸送船《エルシオン》")
    expect(book.html).toContain('<em class="rb-dots">本当に</em>')
  })

  test("2 桁の数字と !? を縦中横にし、3 桁以上や英数字の続きは変えない", () => {
    const book = prepareBookHtml("<p>12月25日、AU-07M、2026年!?</p>")
    expect(book.html).toContain('<span class="rb-tcy">12</span>月')
    expect(book.html).toContain('<span class="rb-tcy">25</span>日')
    expect(book.html).toContain("AU-07M")
    expect(book.html).toContain("2026年")
    expect(book.html).toContain('<span class="rb-tcy">!?</span>')
  })

  test("本文の文字は HTML として解釈しない（< > はそのまま文字）", () => {
    const book = prepareBookHtml("<p>|&lt;b&gt;《&lt;i&gt;》</p>")
    expect(book.html).toContain("<ruby>&lt;b&gt;<rt>&lt;i&gt;</rt></ruby>")
    expect(book.html).not.toContain("<b>")
  })

  test("見出しと「◆」「第1話」で始まる短い段落を目次に入れる", () => {
    const book = prepareBookHtml(
      "<h2>はじめに</h2><p>◆プロローグ『喪失の蒼穹』</p><p>本文です。</p><p>第2話　出会い</p>",
    )
    expect(book.headings).toEqual([
      { block: 0, text: "はじめに", level: 2 },
      { block: 1, text: "◆プロローグ『喪失の蒼穹』", level: 3 },
      { block: 3, text: "第2話 出会い", level: 3 },
    ])
  })

  test("コードの中は変えない", () => {
    const book = prepareBookHtml("<pre><code>|a《b》 12</code></pre>")
    expect(book.html).toBe('<pre data-b="0"><code>|a《b》 12</code></pre>')
  })
})
