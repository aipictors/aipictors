import { describe, expect, test } from "bun:test"
import { SITE_URL, toUrlSetXml } from "~/lib/server/sitemap.server"

describe("toUrlSetXml", () => {
  test("日本語と英語の URL を互いの別言語版として載せる", () => {
    const xml = toUrlSetXml([{ loc: `${SITE_URL}/tags/cat` }])
    expect(xml).toContain(`<loc>${SITE_URL}/tags/cat</loc>`)
    expect(xml).toContain(`<loc>${SITE_URL}/en/tags/cat</loc>`)
    expect(xml).toContain('hreflang="en"')
  })

  test("hasEnglish が false なら日本語の URL だけ載せる", () => {
    const xml = toUrlSetXml([
      { loc: `${SITE_URL}/tags/%E3%83%AD%E3%83%AA`, hasEnglish: false },
    ])
    expect(xml).toContain(`<loc>${SITE_URL}/tags/%E3%83%AD%E3%83%AA</loc>`)
    expect(xml).not.toContain("/en/tags/")
    expect(xml).not.toContain("hreflang")
  })
})

describe("作品の詳細ページ", () => {
  test("英語の URL（noindex）を載せず、hreflang も付けない", () => {
    const xml = toUrlSetXml([{ loc: `${SITE_URL}/posts/123` }])
    expect(xml).toContain(`<loc>${SITE_URL}/posts/123</loc>`)
    expect(xml).not.toContain("/en/posts/")
    expect(xml).not.toContain("hreflang")
  })
})
