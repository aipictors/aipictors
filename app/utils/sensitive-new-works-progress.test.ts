import { describe, expect, test } from "bun:test"
import { toResumePage } from "~/utils/sensitive-new-works-progress"

describe("toResumePage", () => {
  test("新着がなければ前回のページのまま", () => {
    expect(toResumePage(3, 0, 32)).toBe(3)
  })

  test("1 ページ分に満たない新着ではずらさない", () => {
    expect(toResumePage(3, 31, 32)).toBe(3)
  })

  test("増えたページの分だけ後ろにずらす", () => {
    expect(toResumePage(3, 32, 32)).toBe(4)
    expect(toResumePage(0, 100, 32)).toBe(3)
  })
})
