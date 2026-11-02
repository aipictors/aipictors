import { describe, expect, test } from "bun:test"
import { pickTrendingTags } from "~/components/genre-works/pick-trending-tags"

describe("pickTrendingTags", () => {
  test("2 作品以上に付いたタグを多い順に返す", () => {
    const works = [
      { tagNames: ["猫", "夜景", "着物"] },
      { tagNames: ["猫", "夜景"] },
      { tagNames: ["猫"] },
    ]
    expect(pickTrendingTags(works, { limit: 5 })).toEqual(["猫", "夜景"])
  })

  test("同じ作品に同じタグが重なっても 1 回として数える", () => {
    expect(
      pickTrendingTags([{ tagNames: ["猫", "猫"] }], { limit: 5 }),
    ).toEqual([])
  })

  test("自動生成のようなタグ・出さないタグ・除外したタグは返さない", () => {
    const works = [
      { tagNames: ["Halloween-8dfa6e04", "セクシー", "風景", "和服"] },
      { tagNames: ["Halloween-8dfa6e04", "セクシー", "風景", "和服"] },
    ]
    expect(pickTrendingTags(works, { limit: 5, excludes: ["風景"] })).toEqual([
      "和服",
    ])
  })

  test("limit と空の入力を扱える", () => {
    const works = [{ tagNames: ["a", "b"] }, { tagNames: ["a", "b"] }]
    expect(pickTrendingTags(works, { limit: 1 })).toEqual(["a"])
    expect(pickTrendingTags([{ tagNames: null }], { limit: 1 })).toEqual([])
  })
})
