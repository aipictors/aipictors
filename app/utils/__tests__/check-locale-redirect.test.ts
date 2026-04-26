import { describe, expect, test } from "bun:test"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

function createMockRequest(url: string, headers: Record<string, string> = {}) {
  const normalizedHeaders = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
  )

  return {
    url,
    headers: {
      get(key: string) {
        return normalizedHeaders.get(key.toLowerCase()) ?? null
      },
    },
  } as Request
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

  test("locale cookie が en なら日本語ブラウザでも英語にリダイレクトする", () => {
    const request = createMockRequest("http://example.com/", {
      "Accept-Language": "ja-JP,ja;q=0.9",
      Cookie: "locale=en",
    })
    const result = checkLocaleRedirect(request)

    expect(result).not.toBeNull()
    expect(result?.headers.Location).toBe("/en")
  })

  test("locale cookie が ja なら英語ブラウザでも日本語を維持する", () => {
    const request = createMockRequest("http://example.com/en", {
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: "locale=ja",
    })
    const result = checkLocaleRedirect(request)

    expect(result).not.toBeNull()
    expect(result?.headers.Location).toBe("/")
  })
})
