import { describe, expect, test } from "bun:test"
import { isEmptyComment } from "~/utils/empty-comment"

describe("isEmptyComment", () => {
  test("本文・スタンプ・推しのどれも無いときだけ", () => {
    expect(isEmptyComment({ text: "", sticker: null, support: null })).toBe(
      true,
    )
    expect(isEmptyComment({ text: "  ", stampId: -1, support: null })).toBe(
      true,
    )
    expect(
      isEmptyComment({
        text: "",
        sticker: null,
        support: { totalPt: 0 },
      }),
    ).toBe(true)
  })

  test("どれか 1 つあれば出す", () => {
    expect(isEmptyComment({ text: "すてき", support: null })).toBe(false)
    expect(isEmptyComment({ text: "", sticker: { id: "1" } })).toBe(false)
    expect(isEmptyComment({ text: "", stampId: 3 })).toBe(false)
    expect(isEmptyComment({ text: "", support: { totalPt: 10 } })).toBe(false)
  })
})
