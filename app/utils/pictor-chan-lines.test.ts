import { describe, expect, it } from "bun:test"
import {
  getDailyLineIndex,
  getJstDay,
  isPictorChanBirthday,
} from "~/utils/pictor-chan-lines"

describe("getJstDay", () => {
  it("UTC の夜は日本時間の翌日になる", () => {
    const { month, date } = getJstDay(new Date("2026-11-20T15:00:00Z"))
    expect([month, date]).toEqual([11, 21])
  })
})

describe("getDailyLineIndex", () => {
  it("同じ日本時間の日なら同じ番号で、翌日には変わる", () => {
    const morning = getDailyLineIndex(7, new Date("2026-11-03T00:00:00+09:00"))
    const night = getDailyLineIndex(7, new Date("2026-11-03T23:59:00+09:00"))
    const nextDay = getDailyLineIndex(7, new Date("2026-11-04T00:00:00+09:00"))
    expect(morning).toBe(night)
    expect(nextDay).toBe((morning + 1) % 7)
  })
})

describe("isPictorChanBirthday", () => {
  it("日本時間の 11月21日だけ true", () => {
    expect(isPictorChanBirthday(new Date("2026-11-21T00:00:00+09:00"))).toBe(true)
    expect(isPictorChanBirthday(new Date("2026-11-20T23:59:00+09:00"))).toBe(false)
  })
})
