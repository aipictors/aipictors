import { describe, expect, test } from "bun:test"
import {
  pickDlsiteSearchTags,
  toDlsiteAffiliateUrl,
  toDlsiteAiRankingUrl,
  toDlsiteAiSearchUrl,
} from "~/utils/dlsite-affiliate"

describe("dlsite-affiliate", () => {
  test("リンク作成と同じ形でアフィリエイト ID を付ける", () => {
    expect(
      toDlsiteAffiliateUrl("https://www.dlsite.com/aix/fsr/=/keyword/test/"),
    ).toBe(
      "https://dlaf.jp/home/dlaf/=/aid/AIPICTORS/url/https%3A%2F%2Fwww.dlsite.com%2Faix%2Ffsr%2F%3D%2Fkeyword%2Ftest%2F",
    )
  })

  test("日本語のタグは二重にエンコードして検索に渡す", () => {
    const url = toDlsiteAiSearchUrl(" メイド ")
    const target = decodeURIComponent(url.split("/url/")[1])
    expect(target).toBe(
      "https://www.dlsite.com/aix/fsr/=/keyword/%E3%83%A1%E3%82%A4%E3%83%89/",
    )
  })

  test("ランキングは AI 生成の週間", () => {
    expect(decodeURIComponent(toDlsiteAiRankingUrl().split("/url/")[1])).toBe(
      "https://www.dlsite.com/aix/ranking/week",
    )
  })

  test("タグは空と重複を除いて最大 3 つ", () => {
    expect(
      pickDlsiteSearchTags(["メイド", " ", "メイド", "猫耳", "制服", "水着"]),
    ).toEqual(["メイド", "猫耳", "制服"])
  })
})
