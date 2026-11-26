import { describe, expect, test } from "bun:test"
import { buildWorkMetaDescription } from "~/routes/($lang)._main.posts.$post._index/utils/work-meta-description"
import {
  pickDiscoveryTag,
  toDiscoveryRatings,
} from "~/routes/($lang)._main.posts.$post._index/utils/work-discovery"

const base = {
  title: "宇宙警察",
  userName: "ココアパン",
  model: "Days AI",
  tagNames: ["サイバー", "女の子", "SF", "夜"],
  style: "ILLUSTRATION",
  type: "WORK",
  isPromptPublic: true,
  description: null,
}

describe("buildWorkMetaDescription", () => {
  test("モデル・タグ（3 つまで）・作者から始める", () => {
    expect(buildWorkMetaDescription(base, "ja")).toBe(
      "この作品は「Days AI」で生成された「サイバー」「女の子」「SF」タグがついた「ココアパン」さんのAIイラストです。プロンプト（呪文）も公開されています。",
    )
  })

  test("作者の説明は後ろに付け、長いと切る", () => {
    const text = buildWorkMetaDescription(
      { ...base, isPromptPublic: false, description: "あ".repeat(300) },
      "ja",
    )
    expect(text.startsWith("この作品は「Days AI」")).toBe(true)
    expect(text.length).toBe(200)
    expect(text.endsWith("…")).toBe(true)
  })

  test("モデル・タグ・作者がなくても文になる", () => {
    expect(
      buildWorkMetaDescription(
        {
          ...base,
          userName: null,
          model: null,
          tagNames: [],
          isPromptPublic: false,
          style: "REAL",
        },
        "ja",
      ),
    ).toBe("この作品はAIフォトです。")
  })

  test("英語", () => {
    expect(
      buildWorkMetaDescription({ ...base, isPromptPublic: false }, "en"),
    ).toBe(
      '"宇宙警察" is an AI illustration by ココアパン made with Days AI, tagged サイバー, 女の子, SF on Aipictors.',
    )
  })
})

describe("work discovery", () => {
  test("同じ作品はいつも同じタグ", () => {
    const tags = ["a", "b", "c"]
    expect(pickDiscoveryTag("837631", tags)).toBe(
      pickDiscoveryTag("837631", tags),
    )
    expect(pickDiscoveryTag("837631", tags)).toBe(tags[837631 % 3])
    expect(pickDiscoveryTag("1", [])).toBeNull()
  })

  test("R18 の作品には R18 だけを並べる", () => {
    expect(toDiscoveryRatings("G")).toEqual(["G"])
    expect(toDiscoveryRatings("R15")).toEqual(["G", "R15"])
    expect(toDiscoveryRatings("R18G")).toEqual(["R18", "R18G"])
    expect(toDiscoveryRatings(null)).toEqual(["G"])
  })
})
