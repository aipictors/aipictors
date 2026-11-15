import { describe, expect, test } from "bun:test"
import {
  getSupportTier,
  isCreatorRewardRating,
  pickPinnedSupports,
  SUPPORT_TIERS,
  toSupportPt,
} from "~/utils/support-tier"

describe("getSupportTier", () => {
  test("0 以下は推しなし", () => {
    expect(getSupportTier(0)).toBeNull()
    expect(getSupportTier(-5)).toBeNull()
    expect(getSupportTier(Number.NaN)).toBeNull()
  })

  test("区切りで段階が上がる", () => {
    expect(getSupportTier(1)?.level).toBe(1)
    expect(getSupportTier(19)?.level).toBe(1)
    expect(getSupportTier(20)?.level).toBe(2)
    expect(getSupportTier(50)?.level).toBe(3)
    expect(getSupportTier(100)?.level).toBe(4)
    expect(getSupportTier(299)?.level).toBe(4)
    expect(getSupportTier(300)?.level).toBe(5)
    expect(getSupportTier(1000)?.level).toBe(6)
    expect(getSupportTier(1_000_000)?.level).toBe(6)
  })

  test("6 段階で、区切りと時間は増えていく", () => {
    expect(SUPPORT_TIERS).toHaveLength(6)
    for (let i = 1; i < SUPPORT_TIERS.length; i++) {
      expect(SUPPORT_TIERS[i].minPt).toBeGreaterThan(SUPPORT_TIERS[i - 1].minPt)
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
  const c = (id: string, ago: number, totalPt: number | null) => ({
    id,
    createdAt: now - ago,
    support: totalPt === null ? null : { totalPt },
  })

  test("段階の時間内だけ・段階の高い順・新しい順", () => {
    const picked = pickPinnedSupports(
      [
        c("plain", 10, null),
        c("blue-old", 2 * 3600, 10), // 1 時間を過ぎた
        c("blue-new", 60, 10),
        c("green", 3600, 60),
        c("red", 6 * 24 * 3600, 1000),
        c("red-expired", 8 * 24 * 3600, 1000),
        c("green-newer", 30, 60),
      ],
      now,
    )
    expect(picked.map((x) => x.id)).toEqual([
      "red",
      "green-newer",
      "green",
      "blue-new",
    ])
  })

  test("件数の上限", () => {
    const many = Array.from({ length: 20 }, (_, i) => c(`x${i}`, i, 100))
    expect(pickPinnedSupports(many, now, 5)).toHaveLength(5)
  })
})

test("報酬の対象は全年齢だけ", () => {
  expect(isCreatorRewardRating("G")).toBe(true)
  expect(isCreatorRewardRating("R15")).toBe(true)
  expect(isCreatorRewardRating("R18")).toBe(false)
  expect(isCreatorRewardRating("R18G")).toBe(false)
  expect(isCreatorRewardRating(null)).toBe(false)
})
