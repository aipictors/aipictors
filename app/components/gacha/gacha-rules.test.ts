import { describe, expect, test } from "bun:test"
import {
  planGachaDirection,
  revealPauseOf,
} from "~/components/gacha/gacha-direction"
import {
  formatGachaRate,
  GACHA_DUPLICATE_SHARDS,
  GACHA_POOL,
  GACHA_RATES,
  GACHA_UNIQUE_PRIZES,
  toGachaPool,
  toGachaPrizeRate,
  toGachaRarityRates,
} from "~/components/gacha/gacha-rules"

const sum = (rates: Record<string, number>) =>
  Object.values(rates).reduce((a, b) => a + b, 0)

describe("UUR（世界で 1 人だけの枠）", () => {
  test("5 種あり、表は合計 100%。UUR 0.05% は N から引いている", () => {
    expect(GACHA_UNIQUE_PRIZES).toHaveLength(5)
    expect(sum(GACHA_RATES)).toBeCloseTo(100, 9)
    expect(GACHA_RATES.UUR + GACHA_RATES.N).toBeCloseTo(55, 9)
    expect(formatGachaRate(GACHA_RATES.UUR)).toBe("0.05%")
  })

  test("全部残っているとき: 通常は UUR 0.05%・N 54.95%、確定枠は UUR 0.05% と SR 以上 99.95%（サーバーと同じ）", () => {
    const normal = toGachaRarityRates()
    expect(normal.UUR).toBeCloseTo(0.05, 9)
    expect(normal.N).toBeCloseTo(54.95, 9)
    expect(normal.UR).toBeCloseTo(0.3, 9)
    expect(sum(normal)).toBeCloseTo(100, 9)
    const guaranteed = toGachaRarityRates("SR")
    expect(guaranteed.UUR).toBeCloseTo(0.05, 9)
    expect(guaranteed.SR).toBeCloseTo(80 * 0.9995, 9)
    expect(guaranteed.SSR).toBeCloseTo(18 * 0.9995, 9)
    expect(guaranteed.UR).toBeCloseTo(2 * 0.9995, 9)
    expect(sum(guaranteed)).toBeCloseTo(100, 9)
  })

  test("取られた枠は抜けて残りで等分。景品ごとの確率を足すと 100%", () => {
    const taken = GACHA_UNIQUE_PRIZES.slice(0, 3).map((p) => p.id)
    const pool = toGachaPool(taken)
    const left = GACHA_UNIQUE_PRIZES[4]
    const gone = GACHA_UNIQUE_PRIZES[0]
    if (!left || !gone) throw new Error("no UUR")
    expect(toGachaPrizeRate(left, "normal", pool)).toBeCloseTo(0.025, 9)
    expect(toGachaPrizeRate(gone, "normal", pool)).toBe(0)
    const total = GACHA_POOL.reduce(
      (s, p) => s + toGachaPrizeRate(p, "normal", pool),
      0,
    )
    expect(total).toBeCloseTo(100, 9)
  })

  test("全部取られたら UUR 0% で N 55% に戻り、確定枠は SR 以上で 100%", () => {
    const pool = toGachaPool(GACHA_UNIQUE_PRIZES.map((p) => p.id))
    const normal = toGachaRarityRates("N", pool)
    expect(normal.UUR).toBe(0)
    expect(normal.N).toBeCloseTo(55, 9)
    expect(sum(normal)).toBeCloseTo(100, 9)
    const guaranteed = toGachaRarityRates("SR", pool)
    expect(guaranteed.UUR).toBe(0)
    expect(guaranteed.SR).toBeCloseTo(80, 9)
  })

  test("かぶらない・演出は白金の光で、UR より長くためる", () => {
    expect(GACHA_DUPLICATE_SHARDS.UUR).toBe(0)
    const prize = GACHA_UNIQUE_PRIZES[0]
    if (!prize) throw new Error("no UUR")
    const direction = planGachaDirection(
      [{ id: "1", rarity: "UUR", name: prize.name, imageUrl: prize.imageUrl }],
      () => 0.99,
    )
    expect(direction.top).toBe("UUR")
    expect(direction.hint).toBe("legend")
    expect(direction.cutIn).toBe(true)
    // 昇格するときは虹（UR の色）から白金へ
    const promoted = planGachaDirection(
      [{ id: "1", rarity: "UUR", name: prize.name, imageUrl: prize.imageUrl }],
      () => 0,
    )
    expect(promoted.hint).toBe("rainbow")
    expect(promoted.promoteTo).toBe("legend")
    expect(revealPauseOf("UUR")).toBeGreaterThan(revealPauseOf("UR"))
  })
})
