import { describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { gachaRarityRank } from "~/components/gacha/gacha-direction"
import {
  createSeededRandom,
  DEFAULT_GACHA_SETTINGS,
  drawGacha,
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

describe("天井（交換 pt）", () => {
  test("1 回ごとに 1 たまり、UR が出ても減らない", () => {
    const result = drawGacha({
      pool,
      settings: DEFAULT_GACHA_SETTINGS,
      state: { exchangePoints: 195 },
      count: 10,
      random: () => 0,
    })
    expect(result.pulls.every((pull) => pull.prize.rarity === "UR")).toBe(true)
    expect(result.state.exchangePoints).toBe(205)
  })

  test("200 回引けば全員 1 回は交換できる", () => {
    const summary = simulateGacha({
      pool,
      settings: DEFAULT_GACHA_SETTINGS,
      players: 50,
      pullsPerPlayer: 200,
      mode: "ten",
      random: createSeededRandom(7),
    })
    expect(summary.pityHits).toBe(50)
  })
})

describe("10 連", () => {
  test("1 枠は SR 以上", () => {
    const random = createSeededRandom(3)
    for (let i = 0; i < 500; i++) {
      const { pulls } = drawGacha({
        pool,
        settings: DEFAULT_GACHA_SETTINGS,
        state: { exchangePoints: 0 },
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
      state: { exchangePoints: 0 },
      count: 1,
      random: () => 0.5,
    })
    expect(pulls[0].byGuarantee).toBe(false)
  })
})
