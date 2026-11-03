import { describe, expect, test } from "bun:test"
import { toLocaleTo } from "~/lib/app/locale-router"

describe("toLocaleTo", () => {
  test("英語のページからのリンクは /en を付ける", () => {
    expect(toLocaleTo("en", "/home")).toBe("/en/home")
    expect(toLocaleTo("en", "/")).toBe("/en")
    expect(toLocaleTo("en", "/r/posts/1?page=2#c")).toBe("/en/r/posts/1?page=2#c")
    expect(toLocaleTo("en", "/en/home")).toBe("/en/home")
    expect(toLocaleTo("en", { pathname: "/tags", search: "?a=1" })).toEqual({
      pathname: "/en/tags",
      search: "?a=1",
    })
  })

  test("日本語のページ・相対パス・外部リンク・言語のないルートはそのまま", () => {
    expect(toLocaleTo("ja", "/home")).toBe("/home")
    expect(toLocaleTo("en", "?page=2")).toBe("?page=2")
    expect(toLocaleTo("en", "../x")).toBe("../x")
    expect(toLocaleTo("en", "https://example.com/a")).toBe("https://example.com/a")
    expect(toLocaleTo("en", "//example.com/a")).toBe("//example.com/a")
    expect(toLocaleTo("en", "/api/coins/summary")).toBe("/api/coins/summary")
    expect(toLocaleTo("en", "/sitemaps/pages.xml")).toBe("/sitemaps/pages.xml")
    expect(toLocaleTo("en", { search: "?a=1" })).toEqual({ search: "?a=1" })
  })
})
