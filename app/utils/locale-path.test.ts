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
})
