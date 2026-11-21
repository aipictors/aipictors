import { describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { gachaRarityRank } from "~/components/gacha/gacha-direction"
import {
  createSeededRandom,
  DEFAULT_GACHA_SETTINGS,
  drawGacha,
  type GachaSettings,
  simulateGacha,
  sumRates,
  toEffectiveRates,
  toPrizeRates,
} from "~/components/gacha/gacha-lottery"
import { GACHA_PRIZES } from "~/components/gacha/gacha-prizes"

const pool = GACHA_PRIZES.filter((prize) => prize.inPool)

describe("景品一覧", () => {
  test("画像がある・id がかぶらない", () => {
    const ids = new Set(GACHA_PRIZES.map((prize) => prize.id))
    expect(ids.size).toBe(GACHA_PRIZES.length)
    for (const prize of GACHA_PRIZES) {
      expect(existsSync(join("public", prize.imageUrl))).toBe(true)
    }
  })

  test("どのレア度にも景品がある", () => {
    for (const rarity of ["N", "R", "SR", "SSR", "UR"] as const) {
      expect(pool.some((prize) => prize.rarity === rarity)).toBe(true)
    }
  })
})

describe("確率", () => {
  test("いまの設定は合計 100%・UR 0.3%", () => {
    expect(sumRates(DEFAULT_GACHA_SETTINGS.rates)).toBeCloseTo(100, 6)
    expect(DEFAULT_GACHA_SETTINGS.rates.UR).toBe(0.3)
  })

  test("景品ごとの確率を足すと 100%", () => {
    const rates = toPrizeRates(pool, DEFAULT_GACHA_SETTINGS.rates)
    const total = [...rates.values()].reduce((sum, value) => sum + value, 0)
    expect(total).toBeCloseTo(100, 6)
  })

  test("景品がないレア度は外して割り直す", () => {
    const noUr = pool.filter((prize) => prize.rarity !== "UR")
    const rates = toEffectiveRates(DEFAULT_GACHA_SETTINGS.rates, noUr)
    expect(rates.UR).toBe(0)
    expect(sumRates(rates)).toBeCloseTo(100, 6)
  })

  test("たくさん引くと設定の確率に近づく", () => {
    const summary = simulateGacha({
      pool,
      settings: { ...DEFAULT_GACHA_SETTINGS, pityCount: 0 },
      players: 1,
      pullsPerPlayer: 200_000,
      mode: "single",
      random: createSeededRandom(1),
    })
    expect(summary.rarityCounts.N / 200_000).toBeCloseTo(0.55, 2)
    expect(summary.rarityCounts.SR / 200_000).toBeCloseTo(0.12, 2)
    expect(summary.rarityCounts.UR / 200_000).toBeCloseTo(0.003, 3)
  })
})

describe("天井", () => {
  const neverUr: GachaSettings = {
    ...DEFAULT_GACHA_SETTINGS,
    rates: { UR: 0.0001, SSR: 0, SR: 0, R: 0, N: 99.9999 },
    tenPullGuarantee: null,
  }
  // UR の抽選に当たらない乱数（いちばん下の N に落ちる）
  const lowRandom = () => 0.5

  test("天井の回数目で UR が確定し、数え直しになる", () => {
    const first = drawGacha({
      pool,
      settings: { ...neverUr, pityCount: 5 },
      state: { pullsSinceUr: 0 },
      count: 10,
      random: lowRandom,
    })
    const pityIndexes = first.pulls
      .map((pull, index) => (pull.byPity ? index : -1))
      .filter((index) => index >= 0)
    expect(pityIndexes).toEqual([4, 9])
    expect(first.pulls[4].prize.rarity).toBe("UR")
    expect(first.state.pullsSinceUr).toBe(0)
  })

  test("前の回からの続きも数える", () => {
    const result = drawGacha({
      pool,
      settings: { ...neverUr, pityCount: 200 },
      state: { pullsSinceUr: 199 },
      count: 1,
      random: lowRandom,
    })
    expect(result.pulls[0].byPity).toBe(true)
    expect(result.pulls[0].prize.rarity).toBe("UR")
  })

  test("0 なら天井なし", () => {
    const result = drawGacha({
      pool,
      settings: { ...neverUr, pityCount: 0 },
      state: { pullsSinceUr: 10_000 },
      count: 10,
      random: lowRandom,
    })
    expect(result.pulls.some((pull) => pull.byPity)).toBe(false)
    expect(result.state.pullsSinceUr).toBe(10_010)
  })

  test("200 回引けば必ず UR が 1 つ以上", () => {
    const summary = simulateGacha({
      pool,
      settings: DEFAULT_GACHA_SETTINGS,
      players: 300,
      pullsPerPlayer: 200,
      mode: "ten",
      random: createSeededRandom(7),
    })
    expect(summary.urPlayerRatio).toBe(1)
    expect(summary.pityHits).toBeGreaterThan(0)
  })
})

describe("10 連", () => {
  test("1 枠は SR 以上", () => {
    const random = createSeededRandom(3)
    for (let i = 0; i < 500; i++) {
      const { pulls } = drawGacha({
        pool,
        settings: DEFAULT_GACHA_SETTINGS,
        state: { pullsSinceUr: 0 },
        count: 10,
        random,
      })
      expect(
        pulls.some(
          (pull) => gachaRarityRank(pull.prize.rarity) >= gachaRarityRank("SR"),
        ),
      ).toBe(true)
    }
  })

  test("1 回ずつなら確定はない", () => {
    const { pulls } = drawGacha({
      pool,
      settings: DEFAULT_GACHA_SETTINGS,
      state: { pullsSinceUr: 0 },
      count: 1,
      random: () => 0.5,
    })
    expect(pulls[0].byGuarantee).toBe(false)
  })
})
