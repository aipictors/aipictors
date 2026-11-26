import { describe, expect, test } from "bun:test"
import {
  pickTextEditorImageFiles,
  toImageParagraphs,
} from "~/utils/text-editor-images"

describe("pickTextEditorImageFiles", () => {
  test("画像だけを残りの枚数まで取り出す", () => {
    const files = [
      { type: "image/png", name: "a" },
      { type: "text/plain", name: "b" },
      { type: "image/jpeg", name: "c" },
      { type: "image/webp", name: "d" },
    ]
    const { picked, skipped } = pickTextEditorImageFiles(files, 2)
    expect(picked.map((file) => file.name)).toEqual(["a", "c"])
    expect(skipped).toBe(1)
  })

  test("上限に達していれば何も上げない", () => {
    const { picked, skipped } = pickTextEditorImageFiles(
      [{ type: "image/png" }],
      0,
    )
    expect(picked).toEqual([])
    expect(skipped).toBe(1)
  })
})

describe("toImageParagraphs", () => {
  test("1 枚ずつ段落にして間に空行を挟む", () => {
    expect(toImageParagraphs(["x", "y"])).toEqual([
      { type: "paragraph", content: [{ type: "image", attrs: { src: "x" } }] },
      { type: "paragraph" },
      { type: "paragraph", content: [{ type: "image", attrs: { src: "y" } }] },
      { type: "paragraph" },
    ])
  })
})
