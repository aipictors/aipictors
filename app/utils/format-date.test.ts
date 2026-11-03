import { describe, expect, test } from "bun:test"
import { format } from "date-fns"
import { formatDate } from "./format-date"

const PATTERNS = [
  "yyyy年MM月dd日",
  "yyyy年MM月dd日 HH時mm分",
  "yyyy/MM/dd",
  "yyyy/MM/dd HH:mm",
  "yyyy-MM-dd",
  "yyyyMMdd-HHmmss",
  "yyyyMMddHHmmss",
  "MM/dd",
]

const DATES = [
  new Date(2026, 0, 1, 0, 0, 0),
  new Date(2026, 10, 4, 1, 2, 3),
  new Date(2024, 1, 29, 23, 59, 59),
  new Date(1999, 11, 31, 12, 30, 5),
]

describe("formatDate", () => {
  test("date-fns の format と同じ文字になる", () => {
    for (const pattern of PATTERNS) {
      for (const date of DATES) {
        expect(formatDate(date, pattern)).toBe(format(date, pattern))
      }
    }
  })

  test("不正な日付は date-fns と同じく RangeError", () => {
    expect(() => formatDate(new Date(Number.NaN), "yyyy")).toThrow(RangeError)
  })
})
