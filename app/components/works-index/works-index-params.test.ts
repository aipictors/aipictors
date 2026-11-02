import { describe, expect, test } from "bun:test"
import {
  parseWorksIndexPage,
  toLastPage,
  toPageItems,
  toWorkExcerpt,
  toWorksIndexSearch,
} from "~/components/works-index/works-index-params"

describe("parseWorksIndexPage", () => {
  test("数字だけを読む", () => {
    expect(parseWorksIndexPage("3")).toBe(3)
    expect(parseWorksIndexPage(null)).toBe(0)
    expect(parseWorksIndexPage("-1")).toBe(0)
    expect(parseWorksIndexPage("1e3")).toBe(0)
    expect(parseWorksIndexPage("99999999999999999999")).toBe(0)
  })
})

describe("toLastPage", () => {
  test("作品数から最後のページを出す", () => {
    expect(toLastPage(0)).toBe(0)
    expect(toLastPage(24)).toBe(0)
    expect(toLastPage(25)).toBe(1)
    expect(toLastPage(909)).toBe(37)
  })

  test("上限を超えない", () => {
    expect(toLastPage(469840)).toBe(63)
  })
})

describe("toPageItems", () => {
  test("少ないときは全部出す", () => {
    expect(toPageItems(0, 0)).toEqual([0])
    expect(toPageItems(2, 6)).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  test("多いときは間を省いて 7 個に収める", () => {
    expect(toPageItems(0, 37)).toEqual([0, 1, 2, 3, "gap", 37])
    expect(toPageItems(10, 37)).toEqual([0, "gap", 9, 10, 11, "gap", 37])
    expect(toPageItems(37, 37)).toEqual([0, "gap", 34, 35, 36, 37])
  })
})

describe("toWorksIndexSearch", () => {
  test("既定の値は URL に残さない", () => {
    expect(toWorksIndexSearch({})).toBe("")
    expect(toWorksIndexSearch({ sort: null, page: 0 })).toBe("")
    expect(toWorksIndexSearch({ sort: "popular", page: 2, q: "猫" })).toBe(
      "?q=%E7%8C%AB&sort=popular&page=2",
    )
  })
})

describe("toWorkExcerpt", () => {
  test("URL や記号、改行を除く", () => {
    expect(
      toWorkExcerpt("**第二話**\nつづき https://example.com/a\n\nおわり"),
    ).toBe("第二話 つづき おわり")
    expect(toWorkExcerpt(null)).toBe("")
  })

  test("長い文は省略する", () => {
    expect(toWorkExcerpt("あ".repeat(100), 10)).toBe(`${"あ".repeat(10)}…`)
  })
})
