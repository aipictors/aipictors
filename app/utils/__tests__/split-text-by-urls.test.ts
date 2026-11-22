import { describe, expect, test } from "bun:test"
import { splitTextByUrls } from "~/utils/split-text-by-urls"

describe("splitTextByUrls", () => {
  test("URL とそれ以外に分ける", () => {
    expect(splitTextByUrls("配布元 https://civitai.com/models/1 です")).toEqual(
      [
        { type: "text", value: "配布元 " },
        { type: "url", value: "https://civitai.com/models/1" },
        { type: "text", value: " です" },
      ],
    )
  })

  test("末尾の句読点・閉じかっこ・日本語は URL に含めない", () => {
    expect(
      splitTextByUrls("（https://example.com/a?b=1）。").map((p) => p.value),
    ).toEqual(["（", "https://example.com/a?b=1", "）。"])
    expect(
      splitTextByUrls("https://example.com/x.、次").map((p) => p.value),
    ).toEqual(["https://example.com/x", ".、次"])
  })

  test("URL がなければそのまま、改行は残す", () => {
    expect(splitTextByUrls("一行目\n二行目")).toEqual([
      { type: "text", value: "一行目\n二行目" },
    ])
    expect(splitTextByUrls("a\nhttp://x.jp\nb").map((p) => p.type)).toEqual([
      "text",
      "url",
      "text",
    ])
  })
})
