import { expect, test } from "bun:test"
import { buildSearchPath } from "~/utils/search-route"

test("タグの印（半角・全角の＃）を外してタグ名で探す", () => {
  expect(buildSearchPath("＃小説")).toBe(
    `/search?tag=${encodeURIComponent("小説")}&age_limit=`,
  )
  expect(buildSearchPath("#小説")).toBe(
    `/search?tag=${encodeURIComponent("小説")}&age_limit=`,
  )
  expect(buildSearchPath("＃")).toBe("/search")
})
