import { describe, expect, test } from "bun:test"
import {
  isAutoMosaicRating,
  resolvePostMosaicImages,
} from "~/routes/($lang)._main.new.image/utils/post-auto-mosaic"

const mosaicItem = {
  id: 0,
  content: "data:image/webp;base64,MOSAIC",
  mosaic: {
    source: "data:image/png;base64,SOURCE",
    mask: "data:image/png;base64,MASK",
    style: "mosaic" as const,
    strength: 1,
    isAuto: true,
  },
}

describe("resolvePostMosaicImages", () => {
  test("投稿者がかけたモザイクをそのまま使い、元の画像と同じサムネイル・OGP はかけた後の画像にする", () => {
    const result = resolvePostMosaicImages({
      items: [mosaicItem, { id: 1, content: "data:image/png;base64,PLAIN" }],
      thumbnailBase64: "data:image/png;base64,SOURCE",
      ogpBase64: "data:image/png;base64,SOURCE",
    })
    expect(result.contents).toEqual([
      "data:image/webp;base64,MOSAIC",
      "data:image/png;base64,PLAIN",
    ])
    expect(result.thumbnailBase64).toBe("data:image/webp;base64,MOSAIC")
    expect(result.ogpBase64).toBe("data:image/webp;base64,MOSAIC")
    expect(result.mosaicImageCount).toBe(1)
  })

  test("モザイクをかけていない画像・別に選んだサムネイルは変えない（自動ではかけない）", () => {
    const result = resolvePostMosaicImages({
      items: [{ id: 0, content: "data:image/png;base64,PLAIN" }],
      thumbnailBase64: "data:image/png;base64,OTHER",
      ogpBase64: null,
    })
    expect(result.contents).toEqual(["data:image/png;base64,PLAIN"])
    expect(result.thumbnailBase64).toBe("data:image/png;base64,OTHER")
    expect(result.ogpBase64).toBeNull()
    expect(result.mosaicImageCount).toBe(0)
  })
})

test("おすすめのモザイクは R18 / R18G だけ", () => {
  expect(isAutoMosaicRating("R18")).toBe(true)
  expect(isAutoMosaicRating("R18G")).toBe(true)
  expect(isAutoMosaicRating("R15")).toBe(false)
  expect(isAutoMosaicRating("G")).toBe(false)
})
