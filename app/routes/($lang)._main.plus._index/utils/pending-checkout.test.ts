import { describe, expect, test } from "bun:test"
import { parsePendingCheckout } from "~/routes/($lang)._main.plus._index/utils/pending-checkout"

describe("parsePendingCheckout", () => {
  const now = 1_800_000_000_000

  test("押した直後のプランを返す", () => {
    const raw = JSON.stringify({ passType: "LITE", interval: "month", at: now - 60_000 })
    expect(parsePendingCheckout(raw, now)).toEqual({ passType: "LITE", interval: "month" })
  })

  test("15 分を過ぎたものは使わない", () => {
    const raw = JSON.stringify({ passType: "LITE", interval: "month", at: now - 16 * 60_000 })
    expect(parsePendingCheckout(raw, now)).toBeNull()
  })

  test("知らないプラン・壊れた値は使わない", () => {
    expect(parsePendingCheckout(JSON.stringify({ passType: "TWO_DAYS", interval: "month", at: now }), now)).toBeNull()
    expect(parsePendingCheckout(JSON.stringify({ passType: "LITE", interval: "week", at: now }), now)).toBeNull()
    expect(parsePendingCheckout("{", now)).toBeNull()
    expect(parsePendingCheckout("null", now)).toBeNull()
  })
})
