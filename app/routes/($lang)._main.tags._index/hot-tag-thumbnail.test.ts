import { describe, expect, test } from "bun:test"
import { toHotTagThumbnailUrl } from "~/routes/($lang)._main.tags._index/hot-tag-thumbnail"

const work = (rating: string | null) => ({
  smallThumbnailImageURL: "https://example.com/thumb",
  rating,
})

describe("toHotTagThumbnailUrl", () => {
  test("全年齢のページでは全年齢（G）の作品だけサムネイルにする", () => {
    expect(toHotTagThumbnailUrl(work("G"), false)).toBe(
      "https://example.com/thumb",
    )
    expect(toHotTagThumbnailUrl(work("R15"), false)).toBeNull()
    expect(toHotTagThumbnailUrl(work("R18"), false)).toBeNull()
    expect(toHotTagThumbnailUrl(work("R18G"), false)).toBeNull()
    expect(toHotTagThumbnailUrl(work(null), false)).toBeNull()
  })

  test("R18 のページでは年齢制限で隠さない", () => {
    expect(toHotTagThumbnailUrl(work("R18"), true)).toBe(
      "https://example.com/thumb",
    )
  })

  test("作品がなければサムネイルなし", () => {
    expect(toHotTagThumbnailUrl(null, false)).toBeNull()
  })
})
