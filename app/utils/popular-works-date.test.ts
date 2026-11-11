import { expect, test } from "bun:test"
import {
  parsePopularWorksDate,
  shiftDateString,
  toJstDateString,
  toPopularWorksPath,
  toPopularWorksPathFromNotification,
} from "~/utils/popular-works-date"

test("toJstDateString は日本時間の日付にする", () => {
  expect(toJstDateString(new Date("2026-11-10T14:59:59Z"))).toBe("2026-11-10")
  expect(toJstDateString(new Date("2026-11-10T15:00:00Z"))).toBe("2026-11-11")
})

test("shiftDateString は月や年をまたぐ", () => {
  expect(shiftDateString("2026-03-01", -1)).toBe("2026-02-28")
  expect(shiftDateString("2026-12-31", 1)).toBe("2027-01-01")
})

test("parsePopularWorksDate は正しい日付だけ通す", () => {
  const today = "2026-11-11"
  expect(parsePopularWorksDate("2026-11-10", today)).toBe("2026-11-10")
  expect(parsePopularWorksDate("2026-11-11", today)).toBe("2026-11-11")
  expect(parsePopularWorksDate("2026-11-12", today)).toBeNull()
  expect(parsePopularWorksDate("2026-02-31", today)).toBeNull()
  expect(parsePopularWorksDate("2022-12-31", today)).toBeNull()
  expect(parsePopularWorksDate("20261110", today)).toBeNull()
  expect(parsePopularWorksDate(null, today)).toBeNull()
})

test("toPopularWorksPath", () => {
  expect(toPopularWorksPath({ isSensitive: false })).toBe("/popular")
  expect(toPopularWorksPath({ isSensitive: true, date: "2026-11-10" })).toBe(
    "/r/popular?date=2026-11-10",
  )
})

test("人気作品の通知からその日のページへ", () => {
  expect(
    toPopularWorksPathFromNotification(
      "今日の人気作品に選ばれました！：2026-11-11",
    ),
  ).toBe("/popular?date=2026-11-11")
  expect(
    toPopularWorksPathFromNotification(
      "今日のR18人気作品に選ばれました！：2026-11-11",
    ),
  ).toBe("/r/popular?date=2026-11-11")
  expect(
    toPopularWorksPathFromNotification("デイリーランキング 1 位"),
  ).toBeNull()
  expect(toPopularWorksPathFromNotification(null)).toBeNull()
})
