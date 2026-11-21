/**
 * ガチャの抽選（レア度の確率・10 連の SR 以上 1 枠確定・交換 pt）。
 * 本番の抽選は aipictors-system（lib/gacha-rules.ts）で行う。ここは管理ページのシミュレーション用で、決まりは gacha-rules.ts と同じ。
 * 乱数は引数で渡すので、テストやシミュレーションで同じ結果を出し直せる。
 * 景品はレア度を決めてから、そのレア度の中で同じ確率で 1 つ選ぶ。
 */
import {
  GACHA_RARITIES,
  type GachaRarity,
  gachaRarityRank,
} from "~/components/gacha/gacha-direction"
import type { GachaPrize } from "~/components/gacha/gacha-prizes"
import { GACHA_PRICES } from "~/components/gacha/gacha-rules"

export type GachaSettings = {
  /** レア度ごとの確率（%）。合計 100 */
  rates: Record<GachaRarity, number>
  /** 天井: 1 回引くと交換 pt が 1 たまり、この数で好きな景品と交換できる。0 で天井なし */
  pityCount: number
  /** 10 連のうち 1 枠はこのレア度以上が確定。null で確定なし */
  tenPullGuarantee: GachaRarity | null
  singleCostCoins: number
  tenCostCoins: number
  /** かぶったときにもらえるかけらの数（レア度ごと） */
  duplicateShards: Record<GachaRarity, number>
  /** かけらで景品と交換するときの数（レア度ごと） */
  exchangeShards: Record<GachaRarity, number>
}

export const DEFAULT_GACHA_SETTINGS: GachaSettings = {
  rates: { UR: 0.3, SSR: 2.7, SR: 12, R: 30, N: 55 },
  pityCount: 200,
  tenPullGuarantee: "SR",
  singleCostCoins: GACHA_PRICES.premiumSingle,
  tenCostCoins: GACHA_PRICES.premiumTen,
  // 10 連で引いたときのひとり平均: 100 回で約 200 個（欲しい SR が 1 つ）、200 回で約 590 個（SSR 1 つ）、
  // 500 回で約 2,100 個（UR 1 つ）。UR は交換 pt（200 回）があるので、かけらでは遠めにする
  duplicateShards: { UR: 300, SSR: 60, SR: 15, R: 4, N: 1 },
  exchangeShards: { UR: 2000, SSR: 450, SR: 120, R: 40, N: 15 },
}

export type GachaState = {
  /** 交換 pt（1 回引くと 1。交換すると減る。UR が出ても減らない） */
  exchangePoints: number
}

export type GachaPull = {
  prize: GachaPrize
  /** 10 連の確定枠で上がった */
  byGuarantee: boolean
}

export type Random = () => number

export const sumRates = (rates: Record<GachaRarity, number>) =>
  GACHA_RARITIES.reduce((sum, rarity) => sum + rates[rarity], 0)

/** 景品が 1 つもないレア度は抽選から外し、残りの確率で割り直す */
export const toEffectiveRates = (
  rates: Record<GachaRarity, number>,
  pool: readonly GachaPrize[],
  minRarity: GachaRarity = "N",
) => {
  const effective = Object.fromEntries(
    GACHA_RARITIES.map((rarity) => [
      rarity,
      gachaRarityRank(rarity) >= gachaRarityRank(minRarity) &&
      pool.some((prize) => prize.rarity === rarity)
        ? rates[rarity]
        : 0,
    ]),
  ) as Record<GachaRarity, number>
  const total = sumRates(effective)
  if (total <= 0) return effective
  for (const rarity of GACHA_RARITIES) {
    effective[rarity] = (effective[rarity] / total) * 100
  }
  return effective
}

const pickRarity = (rates: Record<GachaRarity, number>, random: Random) => {
  const total = sumRates(rates)
  let roll = random() * total
  // 高いレア度から引いていき、浮動小数の端数は N（いちばん下）に落とす
  const ordered = [...GACHA_RARITIES].reverse()
  for (const rarity of ordered) {
    if (rates[rarity] <= 0) continue
    roll -= rates[rarity]
    if (roll < 0) return rarity
  }
  return ordered.filter((rarity) => rates[rarity] > 0).at(-1) ?? "N"
}

const pickPrize = (
  pool: readonly GachaPrize[],
  rarity: GachaRarity,
  random: Random,
) => {
  const candidates = pool.filter((prize) => prize.rarity === rarity)
  return candidates[
    Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
  ]
}

/**
 * count 回引く（1 回か 10 連）。state は引いたあとの値を返す（交換 pt が count 増える）。
 * 景品はレア度の中で同じ確率（持っているかどうかは見ない）
 */
export const drawGacha = (props: {
  pool: readonly GachaPrize[]
  settings: GachaSettings
  state: GachaState
  count: number
  random?: Random
}) => {
  const random = props.random ?? Math.random
  const { settings, pool } = props
  const rates = toEffectiveRates(settings.rates, pool)
  const guarantee = props.count >= 10 ? settings.tenPullGuarantee : null
  const guaranteeRates = guarantee
    ? toEffectiveRates(settings.rates, pool, guarantee)
    : null

  const pulls: GachaPull[] = []
  for (let index = 0; index < props.count; index++) {
    const isLast = index === props.count - 1
    const needsGuarantee =
      guarantee !== null &&
      guaranteeRates !== null &&
      isLast &&
      !pulls.some(
        (pull) =>
          gachaRarityRank(pull.prize.rarity) >= gachaRarityRank(guarantee),
      )

    let rarity: GachaRarity
    let byGuarantee = false
    if (needsGuarantee) {
      rarity = pickRarity(guaranteeRates, random)
      byGuarantee = true
    } else {
      rarity = pickRarity(rates, random)
    }

    pulls.push({ prize: pickPrize(pool, rarity, random), byGuarantee })
  }

  return {
    pulls,
    state: {
      exchangePoints: props.state.exchangePoints + props.count,
    } satisfies GachaState,
  }
}

/** 景品ひとつあたりの確率（%）。10 連の確定枠は入れない、1 回引いたときの値 */
export const toPrizeRates = (
  pool: readonly GachaPrize[],
  rates: Record<GachaRarity, number>,
) => {
  const effective = toEffectiveRates(rates, pool)
  return new Map(
    pool.map((prize) => {
      const sameRarity = pool.filter((p) => p.rarity === prize.rarity).length
      return [prize.id, effective[prize.rarity] / sameRarity]
    }),
  )
}

/** 0〜1 の乱数を、シードから毎回同じ順に出す（mulberry32） */
export const createSeededRandom = (seed: number): Random => {
  let value = seed >>> 0
  return () => {
    value = (value + 0x6d2b79f5) >>> 0
    let t = value
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type GachaSimulationSummary = {
  players: number
  pullsPerPlayer: number
  /** レア度ごとの出た数（全員の合計） */
  rarityCounts: Record<GachaRarity, number>
  /** UR が 1 つ以上出た人の割合（0〜1） */
  urPlayerRatio: number
  /** 交換 pt で交換できた回数（全員の合計。たまった pt を pityCount で割った数） */
  pityHits: number
  /** 最初の UR が出るまでの回数（出た人だけ）。平均と中央値 */
  firstUrPulls: { average: number; median: number } | null
  /** ひとり当たりのかぶりの数の平均 */
  averageDuplicates: number
  /** ひとり当たりのかぶりでたまったかけらの平均 */
  averageShards: number
  /** ひとり当たりの持っていない景品の数の平均（引き終わったとき） */
  averageMissing: number
  /** 全部そろった人の割合（0〜1） */
  completeRatio: number
}

/**
 * players 人がそれぞれ pullsPerPlayer 回引いたときの結果をまとめる。
 * mode が ten なら 10 連でまとめて引く（端数は 1 回ずつ）
 */
export const simulateGacha = (props: {
  pool: readonly GachaPrize[]
  settings: GachaSettings
  players: number
  pullsPerPlayer: number
  mode: "single" | "ten"
  random?: Random
}): GachaSimulationSummary => {
  const random = props.random ?? Math.random
  const rarityCounts = Object.fromEntries(
    GACHA_RARITIES.map((rarity) => [rarity, 0]),
  ) as Record<GachaRarity, number>
  let urPlayers = 0
  let pityHits = 0
  let duplicates = 0
  let shards = 0
  let missing = 0
  let complete = 0
  const firstUrPulls: number[] = []

  for (let player = 0; player < props.players; player++) {
    let state: GachaState = { exchangePoints: 0 }
    const owned = new Set<string>()
    let pulled = 0
    let firstUr: number | null = null
    while (pulled < props.pullsPerPlayer) {
      const left = props.pullsPerPlayer - pulled
      const count = props.mode === "ten" && left >= 10 ? 10 : 1
      const result = drawGacha({
        pool: props.pool,
        settings: props.settings,
        state,
        count,
        random,
      })
      state = result.state
      for (const pull of result.pulls) {
        pulled++
        rarityCounts[pull.prize.rarity]++
        if (pull.prize.rarity === "UR" && firstUr === null) firstUr = pulled
        if (owned.has(pull.prize.id)) {
          duplicates++
          shards += props.settings.duplicateShards[pull.prize.rarity]
        }
        owned.add(pull.prize.id)
      }
    }
    if (props.settings.pityCount > 0) {
      pityHits += Math.floor(state.exchangePoints / props.settings.pityCount)
    }
    if (firstUr !== null) {
      urPlayers++
      firstUrPulls.push(firstUr)
    }
    missing += props.pool.length - owned.size
    if (owned.size === props.pool.length) complete++
  }

  firstUrPulls.sort((a, b) => a - b)
  const players = Math.max(1, props.players)
  return {
    players: props.players,
    pullsPerPlayer: props.pullsPerPlayer,
    rarityCounts,
    urPlayerRatio: urPlayers / players,
    pityHits,
    firstUrPulls:
      firstUrPulls.length > 0
        ? {
            average:
              firstUrPulls.reduce((sum, value) => sum + value, 0) /
              firstUrPulls.length,
            median: firstUrPulls[Math.floor((firstUrPulls.length - 1) / 2)],
          }
        : null,
    averageDuplicates: duplicates / players,
    averageShards: shards / players,
    averageMissing: missing / players,
    completeRatio: complete / players,
  }
}

export type GachaPityProgress = {
  /** 天井なし */
  isOff: boolean
  /** たまった交換 pt */
  count: number
  pityCount: number
  /** 交換できるまであと何回（交換できるときは 0） */
  remaining: number
  /** 0〜1 */
  ratio: number
  /** 次の 10 連で交換できるようになる */
  reachesInTen: boolean
  /** いま交換できる */
  canExchange: boolean
}

/** 交換 pt の進み具合（画面のメーター用） */
export const toPityProgress = (
  state: GachaState,
  settings: Pick<GachaSettings, "pityCount">,
): GachaPityProgress => {
  const pityCount = settings.pityCount
  if (pityCount <= 0) {
    return {
      isOff: true,
      count: state.exchangePoints,
      pityCount: 0,
      remaining: 0,
      ratio: 0,
      reachesInTen: false,
      canExchange: false,
    }
  }
  const count = state.exchangePoints
  const remaining = Math.max(0, pityCount - count)
  return {
    isOff: false,
    count,
    pityCount,
    remaining,
    ratio: Math.min(1, count / pityCount),
    reachesInTen: remaining > 0 && remaining <= 10,
    canExchange: remaining === 0,
  }
}

/** 天井なしで、n 回のうちに UR が 1 つ以上出る確率（0〜1） */
export const urWithinPullsRatio = (urRatePercent: number, pulls: number) =>
  1 - (1 - urRatePercent / 100) ** pulls
