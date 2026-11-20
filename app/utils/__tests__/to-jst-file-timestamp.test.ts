import { expect, test } from "bun:test"
import { toJstFileTimestamp } from "~/utils/to-jst-file-timestamp"

test("日本時間（協定世界時＋9時間）の名前になる", () => {
  expect(toJstFileTimestamp(new Date("2026-11-20T06:30:06Z"))).toBe(
    "20261120153006",
  )
})

test("日付をまたぐ時刻も日本時間で数える", () => {
  expect(toJstFileTimestamp(new Date("2026-11-19T15:00:00Z"))).toBe(
    "20261120000000",
  )
})

test("14 桁の数字だけになる", () => {
  expect(toJstFileTimestamp(new Date("2026-01-02T03:04:05Z"))).toMatch(
    /^\d{14}$/,
  )
})
