import { describe, expect, test } from "bun:test"
import { filterWorksByHiddenUsers } from "~/utils/hidden-user-works"

describe("filterWorksByHiddenUsers", () => {
  const works = [
    { id: "1", user: { id: "u1" } },
    { id: "2", user: { id: "u2" } },
    { id: "3", user: null },
  ]

  test("外す作者の作品を除く", () => {
    expect(
      filterWorksByHiddenUsers(works, new Set(["u2"])).map((w) => w.id),
    ).toEqual(["1", "3"])
  })

  test("外す人がいなければ同じ配列を返す", () => {
    expect(filterWorksByHiddenUsers(works, new Set())).toBe(works)
  })
})
