import { describe, expect, test } from "bun:test"
import { isFirstPageDisconnected } from "./use-paged-infinite"

const items = (ids: number[]) => ids.map((id) => ({ id }))

describe("isFirstPageDisconnected", () => {
  test("1 件でも同じ作品が残っていればつながっている", () => {
    expect(
      isFirstPageDisconnected({
        pages: [items([10, 9, 8]), items([7, 6, 5])],
        nextFirstPage: items([12, 11, 10]),
      }),
    ).toBe(false)
  })

  test("同じ作品が 1 件もなければつながっていない（間が抜ける）", () => {
    expect(
      isFirstPageDisconnected({
        pages: [items([10, 9, 8]), items([7, 6, 5])],
        nextFirstPage: items([20, 19, 18]),
      }),
    ).toBe(true)
  })

  test("2 ページ目以降がなければ捨てるものがないので false", () => {
    expect(
      isFirstPageDisconnected({
        pages: [items([10, 9, 8])],
        nextFirstPage: items([20, 19, 18]),
      }),
    ).toBe(false)
  })

  test("保存した 1 ページ目が空・取り直した 1 ページ目が空なら false", () => {
    expect(
      isFirstPageDisconnected({
        pages: [[], items([7, 6, 5])],
        nextFirstPage: items([20]),
      }),
    ).toBe(false)
    expect(
      isFirstPageDisconnected({
        pages: [items([10]), items([7])],
        nextFirstPage: [],
      }),
    ).toBe(false)
  })
})
