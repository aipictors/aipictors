import { describe, expect, test } from "bun:test"
import { appendGenerationItems } from "~/routes/($lang)._main.new.image/utils/append-generation-items"

describe("appendGenerationItems", () => {
  test("選んだ画像をすべて選んだ順に足す", () => {
    const items = appendGenerationItems(
      [{ id: 0, content: "data:file" }],
      ["data:a", "data:b", "data:c"],
      ["a", "b", "c"],
    )
    expect(items.map((item) => item.content)).toEqual([
      "data:file",
      "data:a",
      "data:b",
      "data:c",
    ])
    expect(items.map((item) => item.generationNanoid ?? null)).toEqual([
      null,
      "a",
      "b",
      "c",
    ])
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length)
  })

  test("中身が同じでも別の生成画像なら足す", () => {
    const items = appendGenerationItems(
      [{ id: 0, content: "data:same", generationNanoid: "a" }],
      ["data:same"],
      ["b"],
    )
    expect(items.map((item) => item.generationNanoid)).toEqual(["a", "b"])
  })

  test("もう入っている生成画像は、中身が変わっていても足さない", () => {
    const items = appendGenerationItems(
      [{ id: 0, content: "data:mosaicked", generationNanoid: "a" }],
      ["data:a", "data:b"],
      ["a", "b"],
    )
    expect(items.map((item) => item.generationNanoid)).toEqual(["a", "b"])
  })

  test("1 回の追加の中で同じ画像が重なっても 1 枚だけ足す", () => {
    const items = appendGenerationItems([], ["data:a", "data:a"], ["a", "a"])
    expect(items).toHaveLength(1)
  })

  test("nanoid のない画像は中身で見分ける", () => {
    const items = appendGenerationItems(
      [{ id: 3, content: "data:a" }],
      ["data:a", "data:b"],
      undefined,
    )
    expect(items.map((item) => item.content)).toEqual(["data:a", "data:b"])
    expect(items[1].id).toBe(4)
  })
})
