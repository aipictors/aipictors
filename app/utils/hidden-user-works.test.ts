import { describe, expect, test } from "bun:test"
import {
  filterWorksByHiddenUsers,
  toHiddenUserIds,
} from "~/utils/hidden-user-works"

describe("toHiddenUserIds", () => {
  test("ブロックした人はいつも外し、ミュートした人は作品を表示しない設定のときだけ外す", () => {
    const base = { mutedUserIds: ["m1"], blockedUserIds: ["b1"] }
    expect([
      ...toHiddenUserIds({ ...base, isShowingMutedUsersWorks: false }),
    ]).toEqual(["b1", "m1"])
    expect([
      ...toHiddenUserIds({ ...base, isShowingMutedUsersWorks: true }),
    ]).toEqual(["b1"])
    // 設定を保存していない人は API と同じく表示する
    expect([
      ...toHiddenUserIds({ ...base, isShowingMutedUsersWorks: null }),
    ]).toEqual(["b1"])
  })
})

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
