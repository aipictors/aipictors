import { describe, expect, test } from "bun:test"
import { addRecentSearch, parseRecentSearches } from "~/utils/recent-searches"

describe("addRecentSearch", () => {
  test("先頭に足し、同じ言葉は前のものを消す", () => {
    expect(addRecentSearch(["猫", "犬"], "犬")).toEqual(["犬", "猫"])
    expect(addRecentSearch(["猫"], " #夏 ")).toEqual(["夏", "猫"])
  })

  test("空の言葉は足さない・20 件まで", () => {
    expect(addRecentSearch(["猫"], "  ")).toEqual(["猫"])
    const many = Array.from({ length: 25 }, (_, i) => `t${i}`)
    expect(addRecentSearch(many, "new")).toHaveLength(20)
  })
})

describe("parseRecentSearches", () => {
  test("壊れた値は空", () => {
    expect(parseRecentSearches("{")).toEqual([])
    expect(parseRecentSearches('{"a":1}')).toEqual([])
    expect(parseRecentSearches('["a",1,"b"]')).toEqual(["a", "b"])
    expect(parseRecentSearches(null)).toEqual([])
  })
})
