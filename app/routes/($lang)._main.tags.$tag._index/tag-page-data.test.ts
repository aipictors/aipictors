import { describe, expect, test } from "bun:test"
import { collectRelatedTags } from "~/routes/($lang)._main.tags.$tag._index/tag-page-data"

describe("collectRelatedTags", () => {
  test("一緒に付いているタグを数え、英語名を作品の enTagNames から付ける", () => {
    const works = [
      { tagNames: ["猫", "夜", "ロリ"], enTagNames: ["cat", "night", null] },
      { tagNames: ["猫", "夜"], enTagNames: [null, "night"] },
      { tagNames: ["猫", "ロリ"], enTagNames: ["cat", null] },
    ]
    expect(collectRelatedTags(works, "猫")).toEqual([
      { name: "夜", enName: "night", count: 2 },
      { name: "ロリ", enName: null, count: 2 },
    ])
  })

  test("同じ作品に同じタグが 2 回あっても 1 回と数える", () => {
    const works = [{ tagNames: ["夜", "夜"], enTagNames: ["night", "night"] }]
    expect(collectRelatedTags(works, "猫")).toEqual([
      { name: "夜", enName: "night", count: 1 },
    ])
  })
})
