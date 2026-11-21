import { describe, expect, test } from "bun:test"
import {
  GACHA_ACHIEVEMENTS,
  newlyUnlockedGachaAchievements,
} from "~/components/gacha/gacha-achievements"
import { toGachaCoinShortage } from "~/components/gacha/gacha-coin-shortage"
import {
  applyGachaPulls,
  completedGachaSets,
  emptyGachaCollection,
  exchangeGachaPrize,
  toGachaSets,
} from "~/components/gacha/gacha-collection"
import {
  createSeededRandom,
  DEFAULT_GACHA_SETTINGS,
  drawGacha,
  toPityProgress,
} from "~/components/gacha/gacha-lottery"
import { GACHA_PRIZES, type GachaPrize } from "~/components/gacha/gacha-prizes"

const pool = GACHA_PRIZES.filter((prize) => prize.inPool)
const prizeOf = (rarity: GachaPrize["rarity"], index = 0) =>
  pool.filter((prize) => prize.rarity === rarity)[index]
const pullOf = (prize: GachaPrize, byPity = false) => ({
  prize,
  byPity,
  byGuarantee: false,
})

describe("かぶりとかけら", () => {
  test("2 回目からはかけらになる", () => {
    const sr = prizeOf("SR")
    const result = applyGachaPulls(
      emptyGachaCollection(),
      [pullOf(sr), pullOf(sr), pullOf(sr)],
      DEFAULT_GACHA_SETTINGS,
    )
    expect(result.outcomes.map((o) => o.isNew)).toEqual([true, false, false])
    expect(result.gainedShards).toBe(
      DEFAULT_GACHA_SETTINGS.duplicateShards.SR * 2,
    )
    expect(result.collection.owned[sr.id]).toBe(3)
  })

  test("かけらで持っていない景品と交換する", () => {
    const collection = {
      ...emptyGachaCollection(),
      shards: DEFAULT_GACHA_SETTINGS.exchangeShards.SR,
    }
    const sr = prizeOf("SR")
    const next = exchangeGachaPrize(collection, sr, DEFAULT_GACHA_SETTINGS)
    expect(next?.shards).toBe(0)
    expect(next?.owned[sr.id]).toBe(1)
    // 持っているもの・足りないときは交換できない
    expect(exchangeGachaPrize(next!, sr, DEFAULT_GACHA_SETTINGS)).toBeNull()
    expect(
      exchangeGachaPrize(next!, prizeOf("SR", 1), DEFAULT_GACHA_SETTINGS),
    ).toBeNull()
  })
})

describe("天井", () => {
  test("天井の UR はまだ持っていない UR から選ぶ", () => {
    const urs = pool.filter((prize) => prize.rarity === "UR")
    const owned = new Set(urs.slice(0, -1).map((prize) => prize.id))
    for (let seed = 1; seed <= 30; seed++) {
      const result = drawGacha({
        pool,
        settings: DEFAULT_GACHA_SETTINGS,
        state: { pullsSinceUr: DEFAULT_GACHA_SETTINGS.pityCount - 1 },
        count: 1,
        random: createSeededRandom(seed),
        owned,
      })
      expect(result.pulls[0].byPity).toBe(true)
      expect(result.pulls[0].prize.id).toBe(urs.at(-1)!.id)
    }
  })

  test("あと何回で確定かを出す", () => {
    const settings = { pityCount: 200 }
    expect(toPityProgress({ pullsSinceUr: 0 }, settings)).toMatchObject({
      remaining: 200,
      reachesInTen: false,
    })
    expect(toPityProgress({ pullsSinceUr: 192 }, settings)).toMatchObject({
      remaining: 8,
      reachesInTen: true,
    })
    expect(toPityProgress({ pullsSinceUr: 0 }, { pityCount: 0 }).isOff).toBe(
      true,
    )
  })
})

describe("実績", () => {
  test("はじめての 10 連で、はじめて・10 連・SSR が同時に付く", () => {
    const before = emptyGachaCollection()
    const pulls = [
      ...Array.from({ length: 9 }, (_, i) => pullOf(prizeOf("N", i))),
      pullOf(prizeOf("SSR")),
    ]
    const after = applyGachaPulls(before, pulls, DEFAULT_GACHA_SETTINGS)
    const keys = newlyUnlockedGachaAchievements(
      before,
      after.collection,
      pool,
    ).map((item) => item.key)
    expect(keys).toEqual([
      "special-gacha-first",
      "special-gacha-ten",
      "special-gacha-first-ssr",
    ])
  })

  test("1 回引きの UR と天井の UR", () => {
    const after = applyGachaPulls(
      emptyGachaCollection(),
      [pullOf(prizeOf("UR"), true)],
      DEFAULT_GACHA_SETTINGS,
    ).collection
    const unlocked = GACHA_ACHIEVEMENTS.filter((item) =>
      item.isUnlocked(after, pool),
    ).map((item) => item.key)
    expect(unlocked).toContain("special-gacha-single-ur")
    expect(unlocked).toContain("special-gacha-pity")
    expect(unlocked).toContain("special-gacha-first-ur")
  })

  test("おそろいはアイコン枠とヘッダー枠が両方そろったとき", () => {
    const set = toGachaSets(pool).find((item) => item.icon.rarity === "SR")!
    const half = applyGachaPulls(
      emptyGachaCollection(),
      [pullOf(set.icon)],
      DEFAULT_GACHA_SETTINGS,
    ).collection
    expect(completedGachaSets(half, pool)).toHaveLength(0)
    const full = applyGachaPulls(
      half,
      [pullOf(set.header)],
      DEFAULT_GACHA_SETTINGS,
    ).collection
    expect(completedGachaSets(full, pool)).toHaveLength(1)
    expect(
      GACHA_ACHIEVEMENTS.find(
        (item) => item.key === "special-gacha-set",
      )?.isUnlocked(full, pool),
    ).toBe(true)
  })

  test("キーは重ならない", () => {
    const keys = GACHA_ACHIEVEMENTS.map((item) => item.key)
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe("足りない分のコイン", () => {
  test("足りない分を 100 枚単位で切り上げ、まとめ買いの候補も出す", () => {
    const result = toGachaCoinShortage({
      balance: 2550,
      cost: 3000,
      bundleCost: 3000,
    })
    expect(result?.shortage).toBe(450)
    expect(result?.exact).toEqual({ coins: 500, bonusCoins: 0, priceYen: 400 })
    expect(result?.options.map((o) => o.coins)).toEqual([500, 1000, 3000])
    expect(result?.options[2].bonusCoins).toBe(300)
  })

  test("足りていれば null", () => {
    expect(toGachaCoinShortage({ balance: 300, cost: 300 })).toBeNull()
  })

  test("少しだけ足りないときも 100 枚から", () => {
    expect(toGachaCoinShortage({ balance: 290, cost: 300 })?.exact.coins).toBe(
      100,
    )
  })
})
