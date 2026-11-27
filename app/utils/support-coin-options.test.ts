import { describe, expect, test } from "bun:test"
import {
  SUPPORT_COIN_OPTIONS,
  toInitialSupportCoinAmount,
} from "./support-coin-options"

describe("SUPPORT_COIN_OPTIONS", () => {
  test("フリーは 50 枚もワンタップで選べる", () => {
    expect(SUPPORT_COIN_OPTIONS.FREE).toEqual([10, 20, 30, 50, 100, 300])
  })

  test("プレミアムは少額と色の区切り", () => {
    expect(SUPPORT_COIN_OPTIONS.PREMIUM).toEqual([1, 2, 100, 500, 1000])
  })
})

describe("toInitialSupportCoinAmount", () => {
  test("プレミアムは 0 枚から（入力欄を空にする）", () => {
    expect(toInitialSupportCoinAmount("PREMIUM", 5000)).toBe(0)
    expect(toInitialSupportCoinAmount("PREMIUM", 0)).toBe(0)
  })

  test("フリーは 10 枚、残高が少なければ残高まで", () => {
    expect(toInitialSupportCoinAmount("FREE", 300)).toBe(10)
    expect(toInitialSupportCoinAmount("FREE", 4)).toBe(4)
    expect(toInitialSupportCoinAmount("FREE", 0)).toBe(0)
  })
})
