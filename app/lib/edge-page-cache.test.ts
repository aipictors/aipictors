import { describe, expect, test } from "bun:test"
import { isSharedPage } from "~/lib/edge-page-cache"

const shared = (path: string) =>
  isSharedPage(new URL(`https://www.aipictors.com${path}`))

describe("isSharedPage", () => {
  test("数の限られた一覧は全拠点で共有する", () => {
    for (const path of [
      "/",
      "/home",
      "/en/home",
      "/en",
      "/r",
      "/r/home",
      "/en/r/home",
      "/rankings",
      "/rankings/2026/10/29",
      "/en/rankings/2026/10",
      "/themes",
      "/themes/2026/10/29",
      "/tags",
      "/posts/2d",
      "/en/posts/novel",
    ]) {
      expect(shared(path)).toBe(true)
    }
  })

  test("作品・タグ・ユーザー・検索条件つきは共有しない", () => {
    for (const path of [
      "/posts/818842",
      "/tags/猫",
      "/users/admin",
      "/search",
      "/home?page=2",
      "/rankings?tab=x",
      "/generation",
    ]) {
      expect(shared(path)).toBe(false)
    }
  })
})
