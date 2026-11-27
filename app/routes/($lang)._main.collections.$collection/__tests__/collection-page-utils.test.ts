import { describe, expect, test } from "bun:test"
import {
  toCollectionCoverUrl,
  toCollectionMetaText,
  toCollectionPageIndex,
  toCollectionTags,
} from "~/routes/($lang)._main.collections.$collection/collection-page-utils"

describe("toCollectionPageIndex", () => {
  test("0 始まりのまま読む", () => {
    expect(toCollectionPageIndex(null)).toBe(0)
    expect(toCollectionPageIndex("0")).toBe(0)
    expect(toCollectionPageIndex("3")).toBe(3)
  })

  test("負の数・数字でないもの・大きすぎるものは最初のページ", () => {
    expect(toCollectionPageIndex("-1")).toBe(0)
    expect(toCollectionPageIndex("abc")).toBe(0)
    expect(toCollectionPageIndex("100")).toBe(0)
  })
})

describe("toCollectionTags", () => {
  test("空のタグと重複を除く", () => {
    expect(toCollectionTags([""])).toEqual([])
    expect(toCollectionTags([" 猫 ", "猫", "", "犬"])).toEqual(["猫", "犬"])
    expect(toCollectionTags(null)).toEqual([])
  })
})

describe("toCollectionCoverUrl", () => {
  const work = (rating: string) => ({
    rating,
    largeThumbnailImageURL: `https://example.com/${rating}.webp`,
  })

  test("表紙があればそれを使う", () => {
    expect(
      toCollectionCoverUrl({
        thumbnailImageURL: "https://example.com/cover.webp",
        firstWorks: [work("G")],
      }),
    ).toBe("https://example.com/cover.webp")
  })

  test("表紙が空なら 1 作目", () => {
    expect(
      toCollectionCoverUrl({ thumbnailImageURL: "", firstWorks: [work("G")] }),
    ).toBe("https://example.com/G.webp")
  })

  test("全年齢のコレクションでは R18 の作品を表紙にしない", () => {
    expect(
      toCollectionCoverUrl({
        thumbnailImageURL: "",
        rating: "G",
        firstWorks: [work("R18")],
      }),
    ).toBeNull()
    expect(
      toCollectionCoverUrl({
        thumbnailImageURL: "",
        isSensitive: true,
        firstWorks: [work("R18")],
      }),
    ).toBe("https://example.com/R18.webp")
  })

  test("作品がなければ null", () => {
    expect(toCollectionCoverUrl({ firstWorks: [] })).toBeNull()
  })
})

describe("toCollectionMetaText", () => {
  test("題名がなければ無題、2 ページ目以降はページを付ける", () => {
    const text = toCollectionMetaText(
      { title: "", description: "", worksCount: 3, user: { name: "A" } },
      1,
    )
    expect(text.title).toBe("無題 - Aさんのコレクション（2ページ目）")
    expect(text.description).toBe("Aさんがまとめた3作品のコレクション「無題」")
  })

  test("説明があればそれを使う", () => {
    const text = toCollectionMetaText(
      { title: "猫", description: "猫の絵", worksCount: 3, user: { name: "A" } },
      0,
    )
    expect(text.title).toBe("猫 - Aさんのコレクション")
    expect(text.description).toBe("猫の絵")
  })
})
