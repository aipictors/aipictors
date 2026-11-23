import { toIconImageUrl, withIconUrlFallback } from "./with-icon-url-fallback"

test("アイコンURLがnullの場合、デフォルトのURLを返す", () => {
  const result = withIconUrlFallback(null)
  expect(result).toBe("https://assets.aipictors.com/no-profile.webp")
})

test("アイコンURLがundefinedの場合、デフォルトのURLを返す", () => {
  const result = withIconUrlFallback(undefined)
  expect(result).toBe("https://assets.aipictors.com/no-profile.webp")
})

test("アイコンURLが空文字の場合、デフォルトのURLを返す", () => {
  const result = withIconUrlFallback("")
  expect(result).toBe("https://assets.aipictors.com/no-profile.webp")
})

test("アイコンURLが有効な場合、そのURLを返す", () => {
  const validUrl = "https://example.com/icon.png"
  const result = withIconUrlFallback(validUrl)
  expect(result).toBe(validUrl)
})

test("画面に出すアイコンは縮小版（files.aipictors.com 以外とデフォルトはそのまま）", () => {
  expect(toIconImageUrl("https://files.aipictors.com/abc")).toBe(
    "https://variants.aipictors.com/v2/240/abc",
  )
  expect(toIconImageUrl("https://files.aipictors.com/abc", 96)).toBe(
    "https://variants.aipictors.com/v2/96/abc",
  )
  expect(toIconImageUrl(null)).toBe(
    "https://assets.aipictors.com/no-profile.webp",
  )
  expect(toIconImageUrl("https://example.com/icon.png")).toBe(
    "https://example.com/icon.png",
  )
})
