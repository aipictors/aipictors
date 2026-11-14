import { describe, expect, test } from "bun:test"
import { isR18Work } from "~/lib/is-r18-work"

describe("isR18Work", () => {
  test("R15 は isSensitive が true でも R18 ではない", () => {
    expect(isR18Work({ rating: "R15", isSensitive: true })).toBe(false)
  })

  test("R18 / R18G は R18", () => {
    expect(isR18Work({ rating: "R18", isSensitive: true })).toBe(true)
    expect(isR18Work({ rating: "R18G", isSensitive: true })).toBe(true)
  })

  test("年齢区分が無いときは isSensitive で決める", () => {
    expect(isR18Work({ isSensitive: true })).toBe(true)
    expect(isR18Work({ rating: null, isSensitive: false })).toBe(false)
  })
})
