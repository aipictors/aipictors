import { toResizedImageSrcSet, toResizedImageUrl } from "./resized-image-url"

const URL = "https://files.aipictors.com/abc-123"

test("files.aipictors.com の画像は縮小版の URL にする", () => {
  expect(toResizedImageUrl(URL, 90)).toBe(
    "https://files.aipictors.com/_w/96/abc-123",
  )
  expect(toResizedImageUrl(URL, 5000)).toBe(
    "https://files.aipictors.com/_w/640/abc-123",
  )
})

test("ほかの画像・縮小済み・クエリ付きはそのまま", () => {
  expect(toResizedImageUrl("https://assets.aipictors.com/a.webp", 96)).toBe(
    "https://assets.aipictors.com/a.webp",
  )
  expect(toResizedImageUrl(`${URL}?x=1`, 96)).toBe(`${URL}?x=1`)
  expect(toResizedImageSrcSet("https://example.com/a.png")).toBeUndefined()
  expect(toResizedImageUrl(null, 96)).toBeUndefined()
})

test("srcset は元画像の幅までにする", () => {
  expect(toResizedImageSrcSet(URL, { minWidth: 160, maxWidth: 300 })).toBe(
    [
      "https://files.aipictors.com/_w/160/abc-123 160w",
      "https://files.aipictors.com/_w/240/abc-123 240w",
      "https://files.aipictors.com/_w/320/abc-123 300w",
    ].join(", "),
  )
})
