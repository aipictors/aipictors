/**
 * スペシャルガチャの決まり（値段・確率・交換）。抽選は aipictors-system（lib/gacha-rules.ts）で行い、
 * ここは画面と確率の表に出すための写し。変えるときは両方を同じ値にする（表示と実際がずれると景品表示法・業界の指針に反する）
 */
import {
  GACHA_RARITIES,
  type GachaRarity,
} from "~/components/gacha/gacha-direction"
import { GACHA_PRIZES, type GachaPrize } from "~/components/gacha/gacha-prizes"

export const GACHA_RATES: Record<GachaRarity, number> = {
  UR: 0.3,
  SSR: 2.7,
  SR: 12,
  R: 30,
  N: 55,
}

/** 10 連の 10 枠目は、それまでに出ていなければこのレア度以上から選ぶ */
export const GACHA_TEN_PULL_GUARANTEE: GachaRarity = "SR"

export const GACHA_PRICES = {
  premiumSingle: 200,
  premiumTen: 2000,
  /** プレミアムコインの 10 連、1 日 1 回目は半額 */
  premiumDailyTen: 1000,
  /** フリーコインは 1 回ずつ。1 日 1 回目はお得 */
  freeFirst: 100,
  freeSingle: 300,
} as const

export const GACHA_FREE_DAILY_LIMIT = 10

/** 1 回引くと 1 たまり、この数で好きな景品を 1 つ選んでもらえる（天井） */
export const GACHA_EXCHANGE_POINTS = 200

export const GACHA_DUPLICATE_SHARDS: Record<GachaRarity, number> = {
  UR: 300,
  SSR: 60,
  SR: 15,
  R: 4,
  N: 1,
}

export const GACHA_EXCHANGE_SHARDS: Record<GachaRarity, number> = {
  UR: 2000,
  SSR: 450,
  SR: 120,
  R: 40,
  N: 15,
}

export const GACHA_POOL: readonly GachaPrize[] = GACHA_PRIZES.filter(
  (prize) => prize.inPool,
)

/** minRarity 以上だけで割り直した確率（%） */
export const toGachaRarityRates = (minRarity: GachaRarity = "N") => {
  const rank = GACHA_RARITIES.indexOf(minRarity)
  const picked = GACHA_RARITIES.filter(
    (rarity) =>
      GACHA_RARITIES.indexOf(rarity) >= rank &&
      GACHA_POOL.some((prize) => prize.rarity === rarity),
  )
  const total = picked.reduce((sum, rarity) => sum + GACHA_RATES[rarity], 0)
  return Object.fromEntries(
    GACHA_RARITIES.map((rarity) => [
      rarity,
      picked.includes(rarity) ? (GACHA_RATES[rarity] / total) * 100 : 0,
    ]),
  ) as Record<GachaRarity, number>
}

/** 景品ひとつあたりの確率（%）。normal: ふつうの枠 / guaranteed: 10 連の確定枠 */
export const toGachaPrizeRate = (
  prize: GachaPrize,
  kind: "normal" | "guaranteed" = "normal",
) => {
  const rates = toGachaRarityRates(
    kind === "guaranteed" ? GACHA_TEN_PULL_GUARANTEE : "N",
  )
  const same = GACHA_POOL.filter((p) => p.rarity === prize.rarity).length
  return same > 0 ? rates[prize.rarity] / same : 0
}

export const formatGachaRate = (percent: number) => {
  if (percent === 0) return "0%"
  if (percent >= 1) return `${Number(percent.toFixed(3))}%`
  return `${Number(percent.toPrecision(3))}%`
}

export type GachaCoinType = "FREE" | "PREMIUM"

/** 次に引くときの値段（サーバーの toGachaPrice と同じ）。null は引けない */
export const toGachaPrice = (props: {
  coinType: GachaCoinType
  count: 1 | 10
  freePullsToday: number
  isPremiumDealAvailable: boolean
}) => {
  if (props.coinType === "FREE") {
    if (props.count !== 1) return null
    if (props.freePullsToday >= GACHA_FREE_DAILY_LIMIT) return null
    return props.freePullsToday === 0
      ? { costCoins: GACHA_PRICES.freeFirst, isDeal: true }
      : { costCoins: GACHA_PRICES.freeSingle, isDeal: false }
  }
  if (props.count === 1) {
    return { costCoins: GACHA_PRICES.premiumSingle, isDeal: false }
  }
  return props.isPremiumDealAvailable
    ? { costCoins: GACHA_PRICES.premiumDailyTen, isDeal: true }
    : { costCoins: GACHA_PRICES.premiumTen, isDeal: false }
}
