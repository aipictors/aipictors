import { describe, expect, test } from "bun:test"
import {
  canServeStaleToBot,
  getSwrSeconds,
  isSharedPage,
  isSharedWorkData,
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

describe("isSharedWorkData", () => {
  const data = (path: string) =>
    isSharedWorkData(new URL(`https://www.aipictors.com${path}`))
  const routes = "routes/($lang),routes/($lang)._main.posts.$post._index"

  test("root を含まない作品ページのデータは共有する", () => {
    expect(data(`/posts/123.data?_routes=${encodeURIComponent(routes)}`)).toBe(true)
    expect(data(`/en/posts/123.data?_routes=${encodeURIComponent(routes)}`)).toBe(true)
  })

  test("root を含むもの・作品以外は共有しない", () => {
    expect(data("/posts/123.data")).toBe(false)
    expect(data("/posts/123.data?_routes=root,routes/x")).toBe(false)
    expect(data(`/users/1.data?_routes=${encodeURIComponent(routes)}`)).toBe(false)
    expect(data(`/posts/123?_routes=${encodeURIComponent(routes)}`)).toBe(false)
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
  test("14 日まではクローラーに古いページを返す", () => {
    expect(canServeStaleToBot(60)).toBe(true)
    expect(canServeStaleToBot(60 * 60 * 47)).toBe(true)
    expect(canServeStaleToBot(60 * 60 * 24 * 14 + 1)).toBe(false)
    expect(canServeStaleToBot(Number.NaN)).toBe(false)
  })
})
