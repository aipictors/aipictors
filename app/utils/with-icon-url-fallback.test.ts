import { withIconUrlFallback } from "./with-icon-url-fallback"

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
