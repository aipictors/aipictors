import { describe, expect, test } from "bun:test"
import { calcOfferBonusCoins } from "~/lib/premium-coins"

describe("calcOfferBonusCoins", () => {
  test("判定が取れないときは上乗せなし", () => {
    expect(calcOfferBonusCoins(1000, null)).toEqual({ firstPurchase: 0, member: 0 })
  })

  test("はじめての購入は同じ枚数を上乗せ（最大 1,000）", () => {
    expect(calcOfferBonusCoins(100, { isFirstPurchase: true, passType: null })).toEqual({
      firstPurchase: 100,
      member: 0,
    })
    expect(calcOfferBonusCoins(10000, { isFirstPurchase: true, passType: null }).firstPurchase).toBe(1000)
  })

  test("プラン加入中は 20%、はじめてと重なる", () => {
    expect(calcOfferBonusCoins(1000, { isFirstPurchase: false, passType: "LITE" })).toEqual({
      firstPurchase: 0,
      member: 200,
    })
    expect(calcOfferBonusCoins(1000, { isFirstPurchase: true, passType: "PREMIUM" })).toEqual({
      firstPurchase: 1000,
      member: 200,
    })
  })
})
