import { toDateTimeText } from "app/_utils/toDateTimeText"
import { describe, expect, test } from "vitest"

describe("toDateTimeText", () => {
  test("タイムスタンプをフォーマットされた日付と時刻のテキストに変換する", () => {
    const timestamp = 1694951164 // 2023年09月17日 20時46分
    const expected = "2023年09月17日 20時46分"
    const result = toDateTimeText(timestamp)
    expect(result).toBe(expected)
  })

  test("エポックタイムのタイムスタンプをフォーマットされた日付と時刻のテキストに変換する", () => {
    const timestamp = 0 // 1970年01月01日 09時00分
    const expected = "1970年01月01日 09時00分"
    const result = toDateTimeText(timestamp)
    expect(result).toBe(expected)
  })
})
