import { describe, expect, test } from "bun:test"
import { toJstDateText } from "~/routes/($lang).generation._index/hooks/use-generation-plan-hint"

describe("toJstDateText", () => {
  test("日本時間の 0 時で日付が変わる", () => {
    expect(toJstDateText(new Date("2026-11-12T14:59:59Z"))).toBe("2026-11-12")
    expect(toJstDateText(new Date("2026-11-12T15:00:00Z"))).toBe("2026-11-13")
  })
})
