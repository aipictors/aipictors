import { describe, expect, test } from "bun:test"
import { getCheckoutLocale } from "~/lib/server/checkout-locale.server"

// テストの環境では Request に Referer を付けられないので、必要な部分だけの形で渡す
const request = (referer?: string) => ({
  url: "https://www.aipictors.com/api/stripe/subscription-checkout",
  headers: {
    get: (name: string) => (name.toLowerCase() === "referer" ? (referer ?? null) : null),
  },
})

describe("getCheckoutLocale", () => {
  test("body の locale を優先する", () => {
    expect(getCheckoutLocale(request("https://www.aipictors.com/plus"), "en")).toBe("en")
    expect(getCheckoutLocale(request("https://www.aipictors.com/en/plus"), "ja")).toBe("ja")
  })

  test("body になければ、呼び出し元のページが /en かどうか", () => {
    expect(getCheckoutLocale(request("https://www.aipictors.com/en/plus"))).toBe("en")
    expect(getCheckoutLocale(request("https://www.aipictors.com/en"), "fr")).toBe("en")
    expect(getCheckoutLocale(request("https://www.aipictors.com/generation"))).toBe("ja")
    expect(getCheckoutLocale(request("https://www.aipictors.com/events/english"))).toBe("ja")
  })

  test("分からなければ null（Referer なし・別のサイト・壊れた値）", () => {
    expect(getCheckoutLocale(request())).toBeNull()
    expect(getCheckoutLocale(request("https://example.com/en/plus"))).toBeNull()
    expect(getCheckoutLocale(request("not a url"))).toBeNull()
  })
})
