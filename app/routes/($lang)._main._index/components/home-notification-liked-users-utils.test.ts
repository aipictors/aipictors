import { describe, expect, test } from "bun:test"
import { toLikedUserEntries } from "~/routes/($lang)._main._index/components/home-notification-liked-users-utils"

const user = (id: string) => ({ id, name: `user${id}` })

describe("toLikedUserEntries", () => {
  test("新しい順に並べる", () => {
    const entries = toLikedUserEntries([
      { id: "a", createdAt: 100, user: user("1") },
      { id: "b", createdAt: 300, user: user("2") },
      { id: "c", createdAt: 200, user: user("3") },
    ])
    expect(entries.map((entry) => entry.id)).toEqual(["b", "c", "a"])
  })

  test("同じ人は新しいほうだけ、匿名は 1 件ずつ残す", () => {
    const entries = toLikedUserEntries([
      { id: "a", createdAt: 300, user: user("1") },
      { id: "b", createdAt: 250, user: null },
      { id: "c", createdAt: 200, user: user("1") },
      { id: "d", createdAt: 100, user: null },
    ])
    expect(entries.map((entry) => entry.id)).toEqual(["a", "b", "d"])
  })
})
