import { describe, expect, test } from "bun:test"
import { stepCoinAmount } from "./step-coin-amount"

describe("stepCoinAmount", () => {
  test("1 枚ずつ増減する", () => {
    expect(stepCoinAmount(10, 1, 1, 100)).toBe(11)
    expect(stepCoinAmount(10, -1, 1, 100)).toBe(9)
  })

  test("0 と残高を超えない", () => {
    expect(stepCoinAmount(0, -1, 1, 100)).toBe(0)
    expect(stepCoinAmount(100, 1, 1, 100)).toBe(100)
    expect(stepCoinAmount(95, 1, 10, 100)).toBe(100)
    expect(stepCoinAmount(0, 1, 1, 0)).toBe(0)
  })

  test("大きい step ではきりのいい数に揃える", () => {
    expect(stepCoinAmount(13, 1, 10, 100)).toBe(20)
    expect(stepCoinAmount(13, -1, 10, 100)).toBe(10)
    expect(stepCoinAmount(20, 1, 10, 100)).toBe(30)
    expect(stepCoinAmount(20, -1, 10, 100)).toBe(10)
  })
})
