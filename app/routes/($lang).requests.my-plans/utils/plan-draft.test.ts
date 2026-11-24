import { describe, expect, test } from "bun:test"
import { toDraftKey } from "./plan-draft"

describe("toDraftKey", () => {
  test("同じ内容なら同じ文字列になる（項目の並び順は関係ない）", () => {
    expect(toDraftKey({ title: "絵を描きます", priceCoins: 500 })).toBe(
      toDraftKey({ priceCoins: 500, title: "絵を描きます" }),
    )
  })

  test("1 文字でも書き足すと変わる", () => {
    expect(toDraftKey({ title: "", priceCoins: 500 })).not.toBe(
      toDraftKey({ title: "あ", priceCoins: 500 }),
    )
  })

  test("配列や真偽値の変化も見分ける", () => {
    expect(toDraftKey({ sampleImageUrls: [] })).not.toBe(
      toDraftKey({ sampleImageUrls: ["https://example.com/a.webp"] }),
    )
    expect(toDraftKey({ isAccepting: true })).not.toBe(
      toDraftKey({ isAccepting: false }),
    )
  })
})
