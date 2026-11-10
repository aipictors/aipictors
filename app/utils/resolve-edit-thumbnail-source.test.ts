import { describe, expect, test } from "bun:test"
import {
  isExistingThumbnailImageChanged,
  resolveEditThumbnailSource,
} from "~/utils/resolve-edit-thumbnail-source"

const work = {
  imageURL: "https://example.com/main.webp",
  largeThumbnailImageURL: "https://example.com/large.webp",
}

describe("isExistingThumbnailImageChanged", () => {
  test("先頭が今の画像のままなら作り直さない", () => {
    expect(isExistingThumbnailImageChanged(work.imageURL, work)).toBe(false)
    expect(
      isExistingThumbnailImageChanged(work.largeThumbnailImageURL, work),
    ).toBe(false)
  })

  test("先頭が別の投稿済み画像に変わったら作り直す", () => {
    expect(
      isExistingThumbnailImageChanged("https://example.com/sub.webp", work),
    ).toBe(true)
  })

  test("新しく選んだ画像は Base64 なので対象外", () => {
    expect(
      isExistingThumbnailImageChanged("data:image/webp;base64,AAAA", work),
    ).toBe(false)
  })
})

describe("resolveEditThumbnailSource", () => {
  test("変わっていなければそのまま返す", async () => {
    expect(await resolveEditThumbnailSource(work.imageURL, work)).toBe(
      work.imageURL,
    )
  })
})
