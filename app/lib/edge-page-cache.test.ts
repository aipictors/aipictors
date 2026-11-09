import { describe, expect, test } from "bun:test"
import {
  canServeStaleToBot,
  getSwrSeconds,
  isSharedPage,
} from "~/lib/edge-page-cache"

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
      "/posts",
      "/novels",
      "/en/notes",
      "/posts/2d",
      "/posts/2.5d",
      "/en/posts/3d",
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
      "/novels?q=abc",
      "/rankings?tab=x",
      "/generation",
    ]) {
      expect(shared(path)).toBe(false)
    }
  })
})

describe("getSwrSeconds", () => {
  test("新着一覧は 10 分まで", () => {
    for (const path of ["/new-works", "/en/new-works", "/r/new-works"]) {
      expect(getSwrSeconds(path, 86400)).toBe(600)
    }
  })

  test("ほかのページは 6 時間以上", () => {
    expect(getSwrSeconds("/", 300)).toBe(21600)
    expect(getSwrSeconds("/rankings", null)).toBe(21600)
  })
})

describe("canServeStaleToBot", () => {
  test("2 日まではクローラーに古いページを返す", () => {
    expect(canServeStaleToBot(60)).toBe(true)
    expect(canServeStaleToBot(60 * 60 * 47)).toBe(true)
    expect(canServeStaleToBot(60 * 60 * 49)).toBe(false)
    expect(canServeStaleToBot(Number.NaN)).toBe(false)
  })
})
