/**
 * ガチャで集めたもの（持っている景品・かけら）と、引いた記録（実績に使う）。
 * かぶった景品は「かけら」になり、かけらは好きな景品と交換できる。
 * 画面にもサーバーにも同じ計算を使えるように、状態を受け取って新しい状態を返すだけにする
 */
import type { GachaRarity } from "~/components/gacha/gacha-direction"
import type { GachaPull, GachaSettings } from "~/components/gacha/gacha-lottery"
import type { GachaPrize } from "~/components/gacha/gacha-prizes"

export type GachaStats = {
  /** 引いた回数（10 連は 10 回） */
  pulls: number
  tenPulls: number
  /** レア度ごとの出た数 */
  rarityCounts: Record<GachaRarity, number>
  /** 交換 pt（天井）で景品と交換した回数 */
  pointExchanges: number
  /** 1 回引きで UR が出た回数 */
  singleUrs: number
  /** 1 回の 10 連で SSR 以上が出た最大の数 */
  bestTenHighCount: number
  exchanges: number
}

export type GachaCollection = {
  /** 景品の id → 持っている数（かぶりも数える） */
  owned: Record<string, number>
  shards: number
  stats: GachaStats
}

export const emptyGachaCollection = (): GachaCollection => ({
  owned: {},
  shards: 0,
  stats: {
    pulls: 0,
    tenPulls: 0,
    rarityCounts: { N: 0, R: 0, SR: 0, SSR: 0, UR: 0, UUR: 0 },
    pointExchanges: 0,
    singleUrs: 0,
    bestTenHighCount: 0,
    exchanges: 0,
  },
})

export type GachaPullOutcome = GachaPull & {
  isNew: boolean
  /** かぶりでもらったかけら（初めてなら 0） */
  shards: number
}

/** 引いた結果を、集めたものに足す */
export const applyGachaPulls = (
  collection: GachaCollection,
  pulls: readonly GachaPull[],
  settings: Pick<GachaSettings, "duplicateShards">,
) => {
  const owned = { ...collection.owned }
  const rarityCounts = { ...collection.stats.rarityCounts }
  let shards = collection.shards
  const outcomes: GachaPullOutcome[] = pulls.map((pull) => {
    const count = owned[pull.prize.id] ?? 0
    const gained = count > 0 ? settings.duplicateShards[pull.prize.rarity] : 0
    owned[pull.prize.id] = count + 1
    rarityCounts[pull.prize.rarity]++
    shards += gained
    return { ...pull, isNew: count === 0, shards: gained }
  })
  const isTen = pulls.length >= 10
  const highCount = pulls.filter(
    (pull) => pull.prize.rarity === "SSR" || pull.prize.rarity === "UR",
  ).length
  const next: GachaCollection = {
    owned,
    shards,
    stats: {
      ...collection.stats,
      pulls: collection.stats.pulls + pulls.length,
      tenPulls: collection.stats.tenPulls + (isTen ? 1 : 0),
      rarityCounts,
      singleUrs:
        collection.stats.singleUrs +
        (!isTen && pulls.some((pull) => pull.prize.rarity === "UR") ? 1 : 0),
      bestTenHighCount: isTen
        ? Math.max(collection.stats.bestTenHighCount, highCount)
        : collection.stats.bestTenHighCount,
    },
  }
  return {
    collection: next,
    outcomes,
    gainedShards: shards - collection.shards,
  }
}

/** かけらで景品と交換する。足りない・もう持っているときは null */
export const exchangeGachaPrize = (
  collection: GachaCollection,
  prize: GachaPrize,
  settings: Pick<GachaSettings, "exchangeShards">,
): GachaCollection | null => {
  const cost = settings.exchangeShards[prize.rarity]
  if ((collection.owned[prize.id] ?? 0) > 0) return null
  if (collection.shards < cost) return null
  return {
    owned: { ...collection.owned, [prize.id]: 1 },
    shards: collection.shards - cost,
    stats: { ...collection.stats, exchanges: collection.stats.exchanges + 1 },
  }
}

export const ownedPrizeCount = (
  collection: GachaCollection,
  pool: readonly GachaPrize[],
) => pool.filter((prize) => (collection.owned[prize.id] ?? 0) > 0).length

/**
 * おそろい（同じ名前のアイコン枠とヘッダー枠）の組。両方あるものだけ
 */
export const toGachaSets = (pool: readonly GachaPrize[]) => {
  const byName = new Map<string, { icon?: GachaPrize; header?: GachaPrize }>()
  for (const prize of pool) {
    const set = byName.get(prize.name) ?? {}
    if (prize.kind === "ICON_FRAME") set.icon = prize
    else set.header = prize
    byName.set(prize.name, set)
  }
  return [...byName.entries()].flatMap(([name, set]) =>
    set.icon && set.header
      ? [{ name, icon: set.icon, header: set.header }]
      : [],
  )
}

export const completedGachaSets = (
  collection: GachaCollection,
  pool: readonly GachaPrize[],
) =>
  toGachaSets(pool).filter(
    (set) =>
      (collection.owned[set.icon.id] ?? 0) > 0 &&
      (collection.owned[set.header.id] ?? 0) > 0,
  )
