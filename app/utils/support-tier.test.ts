import { describe, expect, test } from "bun:test"
import {
  getSupportTier,
  isCreatorRewardRating,
  pickPinnedSupports,
  SUPPORT_TIERS,
  toSupportPt,
} from "~/utils/support-tier"

const coins = (freeCoinAmount: number, premiumCoinAmount: number) => ({
  freeCoinAmount,
  premiumCoinAmount,
})

describe("getSupportTier", () => {
  test("どちらも 0 は推しなし", () => {
    expect(getSupportTier(coins(0, 0))).toBeNull()
    expect(getSupportTier(coins(-5, 0))).toBeNull()
    expect(getSupportTier(null)).toBeNull()
    expect(getSupportTier(coins(Number.NaN, 0))).toBeNull()
  })

  test("フリーだけは枚数に関係なくシルバー", () => {
    expect(getSupportTier(coins(1, 0))?.level).toBe(0)
    expect(getSupportTier(coins(300, 0))?.level).toBe(0)
    expect(getSupportTier(coins(100_000, 0))?.level).toBe(0)
  })

  test("プレミアムを含むとプレミアムの枚数で色が決まる", () => {
    expect(getSupportTier(coins(0, 100))?.level).toBe(1)
    expect(getSupportTier(coins(0, 5))?.level).toBe(1)
    expect(getSupportTier(coins(0, 499))?.level).toBe(1)
    expect(getSupportTier(coins(0, 500))?.level).toBe(2)
    expect(getSupportTier(coins(0, 1000))?.level).toBe(3)
    expect(getSupportTier(coins(0, 2999))?.level).toBe(3)
    expect(getSupportTier(coins(0, 3000))?.level).toBe(4)
    expect(getSupportTier(coins(0, 1_000_000))?.level).toBe(4)
    expect(getSupportTier(coins(10_000, 100))?.level).toBe(1)
  })

  test("5 段階で、区切りと時間は増えていく", () => {
    expect(SUPPORT_TIERS).toHaveLength(5)
    for (let i = 1; i < SUPPORT_TIERS.length; i++) {
      expect(SUPPORT_TIERS[i].minPremium).toBeGreaterThan(
        SUPPORT_TIERS[i - 1].minPremium,
      )
      expect(SUPPORT_TIERS[i].pinSeconds).toBeGreaterThan(
        SUPPORT_TIERS[i - 1].pinSeconds,
      )
    }
  })
})

test("toSupportPt はプレミアム 1 枚 10pt", () => {
  expect(toSupportPt(10, 0)).toBe(10)
  expect(toSupportPt(0, 5)).toBe(50)
  expect(toSupportPt(3, 2)).toBe(23)
})

describe("pickPinnedSupports", () => {
  const now = 1_800_000_000
  const c = (id: string, ago: number, free: number, premium: number) => ({
    id,
    createdAt: now - ago,
    support: free + premium === 0 ? null : coins(free, premium),
  })

  test("時間では消さず・課金額の多い順・同じなら pt の多い順・新しい順", () => {
    const picked = pickPinnedSupports([
      c("plain", 10, 0, 0),
      c("silver-old", 30 * 24 * 3600, 300, 0),
      c("silver-new", 60, 100, 0),
      c("green", 3600, 0, 500),
      c("red-old", 90 * 24 * 3600, 0, 3000),
      c("green-newer", 30, 0, 500),
      c("green-more-free", 7200, 50, 500),
      c("blue", 10, 0, 1),
    ])
    expect(picked.map((x) => x.id)).toEqual([
      "red-old",
      "green-more-free",
      "green-newer",
      "green",
      "blue",
      "silver-old",
      "silver-new",
    ])
  })

  test("件数の上限", () => {
    const many = Array.from({ length: 80 }, (_, i) => c(`x${i}`, i, 0, 100))
    expect(pickPinnedSupports(many)).toHaveLength(50)
    expect(pickPinnedSupports(many, 5)).toHaveLength(5)
  })
})

test("報酬の対象は全年齢だけ", () => {
  expect(isCreatorRewardRating("G")).toBe(true)
  expect(isCreatorRewardRating("R15")).toBe(true)
  expect(isCreatorRewardRating("R18")).toBe(false)
  expect(isCreatorRewardRating("R18G")).toBe(false)
  expect(isCreatorRewardRating(null)).toBe(false)
})
