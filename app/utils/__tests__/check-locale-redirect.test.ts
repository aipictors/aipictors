import { describe, expect, test } from "bun:test"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

function createMockRequest(url: string, headers: Record<string, string> = {}) {
  return new Request(url, {
    headers: new Headers(headers),
  })
}

describe("checkLocaleRedirect", () => {
  test("英語ブラウザ設定で /en へのリダイレクトが行われる", () => {
    const request = createMockRequest("http://example.com/", {
      "Accept-Language": "en-US,en;q=0.9",
    })
    const result = checkLocaleRedirect(request)

    expect(result).not.toBeNull()
    expect(result?.status).toBe(302)
  })

  test("日本語ブラウザ設定でリダイレクトされない", () => {
    const request = createMockRequest("http://example.com/", {
      "Accept-Language": "ja-JP,ja;q=0.9",
    })
    const result = checkLocaleRedirect(request)

    expect(result).toBeNull()
  })

  test("/en パスでリダイレクトが不要の場合", () => {
    const request = createMockRequest("http://example.com/en", {
      "Accept-Language": "en-US,en;q=0.9",
    })
    const result = checkLocaleRedirect(request)

    expect(result).toBeNull()
  })

  test("ブラウザのロケールが不明な場合、デフォルトでjaを使用", () => {
    const request = createMockRequest("http://example.com/", {})
    const result = checkLocaleRedirect(request)

    expect(result).toBeNull() // デフォルトが ja なのでリダイレクトは不要
  })
})
