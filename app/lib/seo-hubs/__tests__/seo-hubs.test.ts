import { describe, expect, test } from "bun:test"
import {
  aggregateModels,
  aggregatePromptTokens,
  aggregateRelatedTags,
  normalizePromptToken,
  splitPrompt,
  toPromptExcerpt,
} from "~/lib/seo-hubs/seo-hub-aggregate"
import {
  isBlockedHubModel,
  isBlockedHubTag,
  isSafeHubPrompt,
  isSafeHubWork,
} from "~/lib/seo-hubs/seo-hub-safety"

describe("呪文の語をそろえる", () => {
  test("強調の括弧・重み・LoRA を外す", () => {
    expect(normalizePromptToken("(outer space:1.2)")).toBe("outer space")
    expect(normalizePromptToken("((Masterpiece))")).toBe("masterpiece")
    expect(normalizePromptToken("nahida \\(genshin impact\\)")).toBe(
      "nahida genshin impact",
    )
    expect(normalizePromptToken("<lora:foo:0.8>")).toBeNull()
    expect(normalizePromptToken("long_hair")).toBe("long hair")
    expect(normalizePromptToken("BREAK")).toBeNull()
    expect(normalizePromptToken("1.2")).toBeNull()
  })

  test("1 作品で同じ語は 1 回", () => {
    expect(splitPrompt("1girl, smile, 1girl\nsmile")).toEqual(["1girl", "smile"])
  })
})

describe("集計", () => {
  const works = [
    { prompt: "masterpiece, 1girl, hatsune miku, smile", negativePrompt: "lowres, bad hands" },
    { prompt: "best quality, 1girl, hatsune miku, twintails", negativePrompt: "lowres" },
    { prompt: "masterpiece, 1girl, hatsune miku, solo", negativePrompt: "" },
  ]

  test("品質の語と中身の語を分け、割合を出す", () => {
    const result = aggregatePromptTokens(works)
    expect(result.promptCount).toBe(3)
    expect(result.content[0]).toEqual({ token: "1girl", count: 3, share: 100 })
    expect(result.content.map((item) => item.token)).toContain("hatsune miku")
    expect(result.content.map((item) => item.token)).not.toContain("masterpiece")
    expect(result.quality[0]).toEqual({ token: "masterpiece", count: 2, share: 67 })
    expect(result.negative[0]).toEqual({ token: "lowres", count: 2, share: 100 })
  })

  test("モデルと関連タグ", () => {
    expect(
      aggregateModels(
        [{ model: "A" }, { model: "B" }, { model: "A" }, { model: "loliX" }],
        { isBlocked: isBlockedHubModel },
      ),
    ).toEqual([
      { name: "A", count: 2 },
      { name: "B", count: 1 },
    ])
    expect(
      aggregateRelatedTags(
        [
          { tagNames: ["初音ミク", "VOCALOID", "ロリ"] },
          { tagNames: ["初音ミク", "VOCALOID"] },
        ],
        "初音ミク",
        { isBlocked: (name) => isBlockedHubTag(name) },
      ),
    ).toEqual([{ name: "VOCALOID", count: 2 }])
  })

  test("例は長すぎない", () => {
    const excerpt = toPromptExcerpt(Array(100).fill("long hair").join(", "), 50)
    expect(excerpt.length).toBeLessThanOrEqual(52)
    expect(excerpt.endsWith("…")).toBe(true)
  })
})

describe("まとめに載せてよいか", () => {
  test("未成年を連想させる呪文は全年齢でも R18 でも使わない", () => {
    expect(isSafeHubPrompt("1girl, (loli:1.2), smile")).toBe(false)
    expect(isSafeHubPrompt("toddler body, 4yo", { isSensitive: true })).toBe(false)
    expect(isSafeHubPrompt("child, park")).toBe(false)
    expect(isSafeHubPrompt("1girl, 12 years old")).toBe(false)
  })

  test("全年齢は性的な語も避ける（R18 では可）", () => {
    expect(isSafeHubPrompt("1girl, nsfw, nude")).toBe(false)
    expect(isSafeHubPrompt("1girl, large breasts")).toBe(false)
    expect(isSafeHubPrompt("1girl, large breasts", { isSensitive: true })).toBe(true)
    expect(isSafeHubPrompt("1girl, smile, cherry blossoms, classroom")).toBe(true)
    // 「牛乳」は性的な語ではない
    expect(isSafeHubPrompt("牛乳を飲む女の子")).toBe(true)
  })

  test("作品のタグも見る", () => {
    expect(isSafeHubWork({ tagNames: ["女子高生"], prompt: "1girl" })).toBe(false)
    expect(isSafeHubWork({ tagNames: ["巨乳"], prompt: "1girl" })).toBe(false)
    expect(isSafeHubWork({ tagNames: ["猫耳"], prompt: "1girl, cat ears" })).toBe(true)
  })

  test("索引に載せないタグ", () => {
    expect(isBlockedHubTag("ロリ")).toBe(true)
    expect(isBlockedHubTag("パンチラ")).toBe(true)
    expect(isBlockedHubTag("!水着企画2024")).toBe(true)
    expect(isBlockedHubTag("AIイラスト")).toBe(true)
    expect(isBlockedHubTag("AIアート AIart AIグラビア")).toBe(true)
    expect(isBlockedHubTag("猫耳")).toBe(false)
    expect(isBlockedHubTag("風景")).toBe(false)
    expect(isBlockedHubTag("少年", { isSensitive: true })).toBe(true)
    expect(isBlockedHubTag("黒髪", { isSensitive: true })).toBe(false)
  })
})
