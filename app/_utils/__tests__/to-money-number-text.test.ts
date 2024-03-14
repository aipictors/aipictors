import { describe, expect, test } from "bun:test"
import { toMoneyNumberText } from "@/app/_utils/to-money-number-text"

describe("toMoneyNumberText", () => {
  test("数値を3桁区切りのテキストに変換する", () => {
    const value = 1234567890
    const expected = "1,234,567,890"
    const result = toMoneyNumberText(value)
    expect(result).toBe(expected)
  })

  test("負の数値を3桁区切りのテキストに変換する", () => {
    const value = -1234567890
    const expected = "-1,234,567,890"
    const result = toMoneyNumberText(value)
    expect(result).toBe(expected)
  })

  test("0を3桁区切りのテキストに変換する", () => {
    const value = 0
    const expected = "0"
    const result = toMoneyNumberText(value)
    expect(result).toBe(expected)
  })
})
