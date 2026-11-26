import { describe, expect, test } from "bun:test"
import { buildAlternateLocaleUrls } from "~/utils/locale-path"

const SITE_URL = "https://www.aipictors.com"

describe("buildAlternateLocaleUrls", () => {
  test("ジャンルの入口の canonical にはクエリを残さない", () => {
    for (const path of ["/posts/2d", "/posts/2.5d", "/posts/3d"]) {
      expect(
        buildAlternateLocaleUrls(path, SITE_URL, "?page=3&sortType=LIKES_COUNT")
          .canonical,
      ).toBe(`${SITE_URL}${path}`)
    }
    expect(
      buildAlternateLocaleUrls("/en/posts/3d", SITE_URL, "?page=2").canonical,
    ).toBe(`${SITE_URL}/en/posts/3d`)
  })

  test("ほかの一覧のページ番号は残す", () => {
    expect(
      buildAlternateLocaleUrls("/tags/猫", SITE_URL, "?page=2").canonical,
    ).toEndWith("?page=2")
    expect(
      buildAlternateLocaleUrls("/r/posts/2d", SITE_URL, "?page=2").canonical,
    ).toEndWith("/r/posts/2d?page=2")
  })

  test("イベント一覧は開催予定・終了の切り替えを残す", () => {
    expect(
      buildAlternateLocaleUrls(
        "/events",
        SITE_URL,
        "?status=ENDED&page=2&sort=POPULAR",
      ).canonical,
    ).toBe(`${SITE_URL}/events?status=ENDED&page=2`)
    expect(
      buildAlternateLocaleUrls("/en/events", SITE_URL, "?status=ONGOING")
        .canonical,
    ).toBe(`${SITE_URL}/en/events`)
  })
})

describe("日本語だけのページ（解説記事）", () => {
  test("英語の URL でも canonical は日本語にし、hreflang を出さない", () => {
    const urls = buildAlternateLocaleUrls("/en/guides/prompt-basics", SITE_URL)
    expect(urls.isJaOnly).toBe(true)
    expect(urls.canonical).toBe(`${SITE_URL}/guides/prompt-basics`)
  })

  test("ほかのページは今までどおり", () => {
    const urls = buildAlternateLocaleUrls("/en/prompts/tags/猫耳", SITE_URL)
    expect(urls.isJaOnly).toBe(false)
    expect(urls.canonical).toBe(`${SITE_URL}/en/prompts/tags/猫耳`)
  })
})

describe("作品の詳細ページ（英語版は noindex）", () => {
  test("日本語・英語・R18 とも hreflang を出さない", () => {
    for (const path of [
      "/posts/123",
      "/en/posts/123",
      "/r/posts/123",
      "/en/r/posts/123",
    ]) {
      expect(buildAlternateLocaleUrls(path, SITE_URL).hasLocaleAlternates).toBe(
        false,
      )
    }
  })

  test("作品の一覧などは今までどおり hreflang を出す", () => {
    for (const path of ["/posts", "/posts/2d", "/en", "/tags/猫"]) {
      expect(buildAlternateLocaleUrls(path, SITE_URL).hasLocaleAlternates).toBe(
        true,
      )
    }
    expect(
      buildAlternateLocaleUrls("/guides/prompt-basics", SITE_URL)
        .hasLocaleAlternates,
    ).toBe(false)
  })
})
