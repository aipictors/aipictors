/**
 * ガチャ演出の段取り（どの色で予告して、昇格するか・確定カットインを出すか）を決める。
 * 景品の中身は関係なく、レア度だけで決めるので、枠以外のガチャにもそのまま使える。
 *
 * 参考にした流れ:
 * - 原神・ブルアカ: 最初の光の色で一番上のレア度を予告する（青 → 紫 → 金 → 虹）
 * - FGO・ウマ娘: 低い色で始まって途中で上の色に化ける「昇格」、決まったレア度以上の「確定」カットイン
 * 予告の色は一番上のレア度より上には絶対にならない（ぬか喜びさせない）
 */

export type GachaRarity = "N" | "R" | "SR" | "SSR" | "UR"

export const GACHA_RARITIES: readonly GachaRarity[] = [
  "N",
  "R",
  "SR",
  "SSR",
  "UR",
]

export const gachaRarityRank = (rarity: GachaRarity) =>
  GACHA_RARITIES.indexOf(rarity)

/** 予告の色 */
export type GachaHint = "blue" | "purple" | "gold" | "rainbow"

export type GachaItem = {
  id: string
  rarity: GachaRarity
  name: string
  imageUrl: string
  /** 初めて出た */
  isNew?: boolean
  /** かぶりで戻ったものなど、カードの下に小さく出す */
  note?: string
}

export type GachaDirection = {
  /** いちばん上のレア度 */
  top: GachaRarity
  /** 最初に見せる色 */
  hint: GachaHint
  /** 昇格したあとの色（昇格しないときは null） */
  promoteTo: GachaHint | null
  /** 確定カットインを出す */
  cutIn: boolean
  /** カットインの文言（例: 「SSR 確定」） */
  cutInLabel: string | null
}

/** レア度に見合う色 */
export const hintOf = (rarity: GachaRarity): GachaHint => {
  if (rarity === "UR") return "rainbow"
  if (rarity === "SSR") return "gold"
  if (rarity === "SR") return "purple"
  return "blue"
}

const HINTS: readonly GachaHint[] = ["blue", "purple", "gold", "rainbow"]

/**
 * 演出の確率（あとから調整しやすいように 1 か所にまとめる）
 * promote: 本来の色の 1 つ下から始めて昇格する確率
 * cutIn: 確定カットインを出す確率
 */
export const GACHA_DIRECTION_RATES: Record<
  GachaRarity,
  { promote: number; cutIn: number }
> = {
  N: { promote: 0, cutIn: 0 },
  R: { promote: 0, cutIn: 0 },
  SR: { promote: 0.2, cutIn: 0 },
  SSR: { promote: 0.3, cutIn: 0.5 },
  UR: { promote: 0.4, cutIn: 1 },
}

export function planGachaDirection(
  items: readonly GachaItem[],
  random: () => number = Math.random,
): GachaDirection {
  if (items.length === 0) throw new Error("items is empty")
  const top = items.reduce<GachaRarity>(
    (best, item) =>
      gachaRarityRank(item.rarity) > gachaRarityRank(best) ? item.rarity : best,
    "N",
  )
  const rates = GACHA_DIRECTION_RATES[top]
  const actual = hintOf(top)
  const isPromoted = random() < rates.promote
  const hint = isPromoted
    ? HINTS[Math.max(0, HINTS.indexOf(actual) - 1)]
    : actual
  const cutIn = random() < rates.cutIn
  return {
    top,
    hint,
    promoteTo: isPromoted && hint !== actual ? actual : null,
    cutIn,
    cutInLabel: cutIn ? `${top} 確定` : null,
  }
}

/** カードの並び順: 引いた順のまま。演出の待ち時間（秒）はレア度が高いほど長い */
export const revealPauseOf = (rarity: GachaRarity) => {
  if (rarity === "UR") return 1.1
  if (rarity === "SSR") return 0.8
  if (rarity === "SR") return 0.35
  return 0.16
}
