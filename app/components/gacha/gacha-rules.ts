/**
 * スペシャルガチャの決まり（値段・確率・交換）。抽選は aipictors-system（lib/gacha-rules.ts）で行い、
 * ここは画面と確率の表に出すための写し。変えるときは両方を同じ値にする（表示と実際がずれると景品表示法・業界の指針に反する）
 */
import {
  GACHA_RARITIES,
  type GachaRarity,
} from "~/components/gacha/gacha-direction"
import { GACHA_PRIZES, type GachaPrize } from "~/components/gacha/gacha-prizes"

/**
 * レア度ごとの確率（%）。合計 100。
 * UUR は 1 回あたり合計 0.05%（残っている UUR で等分）で、その 0.05% は N から引いている（もとは N 55%）。
 * UUR が 1 つも残っていなければ UUR は 0% で、0.05% は N に戻る（N 55%）
 */
export const GACHA_RATES: Record<GachaRarity, number> = {
  UUR: 0.05,
  UR: 0.3,
  SSR: 2.7,
  SR: 12,
  R: 30,
  N: 54.95,
}

/** UUR が残っていないとき、UUR の分を戻すレア度 */
export const GACHA_UNIQUE_FALLBACK: GachaRarity = "N"

export const isUniqueGachaPrize = (prize: Pick<GachaPrize, "rarity">) =>
  prize.rarity === "UUR"

/**
 * 10 連の 10 枠目は、それまでに出ていなければこのレア度以上から選ぶ（UUR も SR 以上に数える）。
 * 確定枠でも UUR は 0.05%（残っていれば）で、残りの 99.95% を SR・SSR・UR で割り直す
 */
export const GACHA_TEN_PULL_GUARANTEE: GachaRarity = "SR"

export const GACHA_PRICES = {
  premiumSingle: 200,
  premiumTen: 2000,
  /** プレミアムコインの 10 連、1 日 1 回目は半額 */
  premiumDailyTen: 1000,
  /** フリーコインは 1 日 1 回だけ、1 回 500 */
  free: 500,
} as const

export const GACHA_FREE_DAILY_LIMIT = 1

/** 1 回引くと 1 たまり、この数で好きな景品を 1 つ選んでもらえる（天井） */
export const GACHA_EXCHANGE_POINTS = 200

/** かぶったときのかけら（UUR は 1 人しか持てないのでかぶらない） */
export const GACHA_DUPLICATE_SHARDS: Record<GachaRarity, number> = {
  UUR: 0,
  UR: 300,
  SSR: 60,
  SR: 15,
  R: 4,
  N: 1,
}

/** かけらで交換するときの数（UUR は交換 pt・かけらでは交換できない） */
export const GACHA_EXCHANGE_SHARDS: Record<GachaRarity, number> = {
  UUR: 0,
  UR: 2000,
  SSR: 450,
  SR: 120,
  R: 40,
  N: 15,
}

/** ガチャの景品（UUR は誰にも取られていないときの全部。取られたものは toGachaPool で外す） */
export const GACHA_POOL: readonly GachaPrize[] = GACHA_PRIZES.filter(
  (prize) => prize.inPool,
)

export const GACHA_UNIQUE_PRIZES: readonly GachaPrize[] =
  GACHA_POOL.filter(isUniqueGachaPrize)

/** 取られた UUR（takenPrizeIds）を外した、いまのガチャの景品 */
export const toGachaPool = (takenPrizeIds: Iterable<string> = []) => {
  const taken = new Set(takenPrizeIds)
  return GACHA_POOL.filter(
    (prize) => !(isUniqueGachaPrize(prize) && taken.has(prize.id)),
  )
}

/**
 * いまの確率（%）。サーバーの toEffectiveRates と同じ計算。
 * - UUR: pool に残っていれば 0.05%（どの枠でも同じ）、なければ 0（その分は N に戻す）
 * - ほかのレア度: 景品が 1 つもないレア度を外し、minRarity 以上だけで「100 - UUR」に割り直す
 */
export const toGachaRarityRates = (
  minRarity: GachaRarity = "N",
  pool: readonly GachaPrize[] = GACHA_POOL,
) => {
  const rank = GACHA_RARITIES.indexOf(minRarity)
  const uniqueRate = pool.some(isUniqueGachaPrize) ? GACHA_RATES.UUR : 0
  const picked = GACHA_RARITIES.filter(
    (rarity) =>
      rarity !== "UUR" &&
      GACHA_RARITIES.indexOf(rarity) >= rank &&
      pool.some((prize) => prize.rarity === rarity),
  )
  const baseOf = (rarity: GachaRarity) =>
    GACHA_RATES[rarity] +
    (rarity === GACHA_UNIQUE_FALLBACK ? GACHA_RATES.UUR - uniqueRate : 0)
  const total = picked.reduce((sum, rarity) => sum + baseOf(rarity), 0)
  return Object.fromEntries(
    GACHA_RARITIES.map((rarity) => [
      rarity,
      rarity === "UUR"
        ? uniqueRate
        : picked.includes(rarity) && total > 0
          ? (baseOf(rarity) / total) * (100 - uniqueRate)
          : 0,
    ]),
  ) as Record<GachaRarity, number>
}

/** 景品ひとつあたりの確率（%）。normal: ふつうの枠 / guaranteed: 10 連の確定枠。pool は取られた UUR を外したもの */
export const toGachaPrizeRate = (
  prize: GachaPrize,
  kind: "normal" | "guaranteed" = "normal",
  pool: readonly GachaPrize[] = GACHA_POOL,
) => {
  if (!pool.some((p) => p.id === prize.id)) return 0
  const rates = toGachaRarityRates(
    kind === "guaranteed" ? GACHA_TEN_PULL_GUARANTEE : "N",
    pool,
  )
  const same = pool.filter((p) => p.rarity === prize.rarity).length
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
    return { costCoins: GACHA_PRICES.free, isDeal: false }
  }
  if (props.count === 1) {
    return { costCoins: GACHA_PRICES.premiumSingle, isDeal: false }
  }
  return props.isPremiumDealAvailable
    ? { costCoins: GACHA_PRICES.premiumDailyTen, isDeal: true }
    : { costCoins: GACHA_PRICES.premiumTen, isDeal: false }
}
