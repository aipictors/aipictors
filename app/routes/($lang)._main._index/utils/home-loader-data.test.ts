import { expect, test } from "bun:test"
import {
  createEmptyReleaseList,
  getRandomHomeCategories,
  getUtcDateString,
  toHomeListWorks,
  toReleaseSummary,
} from "./home-loader-data"

test("UTC の日付を YYYY/MM/DD にする", () => {
  expect(getUtcDateString(new Date("2026-01-05T23:59:59Z"))).toBe("2026/01/05")
})

test("お知らせの空の一覧", () => {
  expect(createEmptyReleaseList()).toEqual({
    contents: [],
    totalCount: 0,
    offset: 0,
    limit: 4,
  })
})

test("お知らせの本文は HTML に入れない", () => {
  const release = { id: "1", description: "本文" }
  expect(toReleaseSummary(release)).toEqual({ id: "1", description: "" })
  expect(release.description).toBe("本文")
})

test("一覧の作品から詳細画面用の項目を除く", () => {
  const work = {
    id: "1",
    prompt: "secret",
    seed: 1,
    likedUsers: [],
    user: { id: "2", name: "名前", biography: "長い", webFcmToken: "token" },
  }
  expect(toHomeListWorks([work])).toEqual([
    { id: "1", user: { id: "2", name: "名前" } },
  ] as never)
  expect(work.user.biography).toBe("長い")
})

test("作品の一覧が配列でなければ空にする", () => {
  expect(toHomeListWorks(null)).toEqual([])
  expect(toHomeListWorks(undefined)).toEqual([])
})

test("user のない作品もそのまま通す", () => {
  expect(toHomeListWorks([{ id: "1", user: null }])).toEqual([
    { id: "1", user: null },
  ])
})

test("タグは同じ秒なら同じ 2 つを選ぶ", () => {
  const date = new Date("2026-01-01T00:00:00Z")
  const categories = getRandomHomeCategories(date)
  expect(categories).toHaveLength(2)
  expect(new Set(categories).size).toBe(2)
  expect(getRandomHomeCategories(date)).toEqual(categories)
})
