import { afterEach, describe, expect, test } from "bun:test"
import {
  getJstDate,
  jstDateTimeToWallClockUnixSeconds,
  toJstWallClockUnixSeconds,
} from "~/utils/jst-date"

const originalToLocaleString = Date.prototype.toLocaleString

afterEach(() => {
  Date.prototype.toLocaleString = originalToLocaleString
})

describe("getJstDate", () => {
  test("日本時間の年月日時分秒をローカル時刻の要素として返す", () => {
    // 2026-10-26T18:13:05Z = 2026-10-27 03:13:05 JST
    const date = getJstDate(new Date("2026-10-26T18:13:05Z"))
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(9)
    expect(date.getDate()).toBe(27)
    expect(date.getHours()).toBe(3)
    expect(date.getMinutes()).toBe(13)
    expect(date.getSeconds()).toBe(5)
  })

  test("ブラウザの表示言語がチェコ語でもInvalid Dateにならない", () => {
    // cs-CZ の toLocaleString は "27. 10. 2026 3:13:05" となり Date でパースできない
    Date.prototype.toLocaleString = () => "27. 10. 2026 3:13:05"
    const date = getJstDate(new Date("2026-10-26T18:13:05Z"))
    expect(Number.isNaN(date.getTime())).toBe(false)
    expect(() => date.toISOString()).not.toThrow()
  })
})

describe("toJstWallClockUnixSeconds", () => {
  test("日本時間の壁時計をUTCとして扱ったUNIX秒を返す", () => {
    const value = toJstWallClockUnixSeconds(
      new Date("2026-09-30T00:30:00+09:00"),
    )
    expect(value).toBe(Date.UTC(2026, 8, 30, 0, 30) / 1000)
  })

  test("開始直後のイベント（00:00 JST 開始）が開始済みと判定できる", () => {
    const eventStartAt = Date.UTC(2026, 8, 30, 0, 0) / 1000
    const now = toJstWallClockUnixSeconds(new Date("2026-09-30T00:30:00+09:00"))
    expect(now >= eventStartAt).toBe(true)
  })
})

describe("jstDateTimeToWallClockUnixSeconds", () => {
  test("日付と時刻をUTCとして扱ったUNIX秒に変換する", () => {
    expect(jstDateTimeToWallClockUnixSeconds("2026-09-30", "12:34")).toBe(
      Date.UTC(2026, 8, 30, 12, 34) / 1000,
    )
  })

  test("不正な値はnullを返す", () => {
    expect(jstDateTimeToWallClockUnixSeconds("", "")).toBeNull()
  })
})
