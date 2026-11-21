/**
 * ガチャの実績。サイトの実績（aipictors-system の achievement-catalog.ts の SPECIALS）と同じキー・ランクにする。
 * 達成の判定はここだけに置き、ガチャの API ができたらサーバーでも同じ関数で判定する
 */
import {
  completedGachaSets,
  type GachaCollection,
  ownedPrizeCount,
} from "~/components/gacha/gacha-collection"
import { gachaRarityRank } from "~/components/gacha/gacha-direction"
import type { GachaPrize } from "~/components/gacha/gacha-prizes"

/** 1 ブロンズ / 2 シルバー / 3 ゴールド / 4 プラチナ / 5 ダイヤモンド / 6 レジェンド */
type Tier = 1 | 2 | 3 | 4 | 5 | 6

export type GachaAchievement = {
  key: string
  tier: Tier
  /** lucide のアイコン名（バッジの絵柄） */
  icon: string
  isHidden: boolean
  name: { ja: string; en: string }
  description: { ja: string; en: string }
  isUnlocked: (
    collection: GachaCollection,
    pool: readonly GachaPrize[],
  ) => boolean
}

export const GACHA_ACHIEVEMENTS: readonly GachaAchievement[] = [
  {
    key: "special-gacha-first",
    tier: 1,
    icon: "gift",
    isHidden: false,
    name: { ja: "はじめてのガチャ", en: "First Pull" },
    description: { ja: "ガチャを引く", en: "Pull the gacha" },
    isUnlocked: (c) => c.stats.pulls >= 1,
  },
  {
    key: "special-gacha-ten",
    tier: 1,
    icon: "layers",
    isHidden: false,
    name: { ja: "10 連デビュー", en: "Ten-Pull Debut" },
    description: { ja: "10 連ガチャを引く", en: "Do a ten-pull" },
    isUnlocked: (c) => c.stats.tenPulls >= 1,
  },
  {
    key: "special-gacha-pulls-100",
    tier: 2,
    icon: "dices",
    isHidden: false,
    name: { ja: "ガチャ好き", en: "Gacha Fan" },
    description: {
      ja: "ガチャを合計 100 回引く",
      en: "Pull 100 times in total",
    },
    isUnlocked: (c) => c.stats.pulls >= 100,
  },
  {
    key: "special-gacha-pulls-500",
    tier: 4,
    icon: "dices",
    isHidden: false,
    name: { ja: "ガチャの達人", en: "Gacha Master" },
    description: {
      ja: "ガチャを合計 500 回引く",
      en: "Pull 500 times in total",
    },
    isUnlocked: (c) => c.stats.pulls >= 500,
  },
  {
    key: "special-gacha-first-ssr",
    tier: 2,
    icon: "star",
    isHidden: false,
    name: { ja: "金色の輝き", en: "Golden Glow" },
    description: { ja: "SSR を引く", en: "Pull an SSR" },
    isUnlocked: (c) => c.stats.rarityCounts.SSR >= 1,
  },
  {
    key: "special-gacha-first-ur",
    tier: 4,
    icon: "sparkles",
    isHidden: false,
    name: { ja: "虹の向こうへ", en: "Over the Rainbow" },
    description: { ja: "UR を引く", en: "Pull a UR" },
    isUnlocked: (c) => c.stats.rarityCounts.UR >= 1,
  },
  {
    key: "special-gacha-pity",
    tier: 3,
    icon: "shield-check",
    isHidden: false,
    name: { ja: "天井まで", en: "Hit the Ceiling" },
    description: {
      ja: "交換 pt で好きな景品と交換する",
      en: "Trade exchange points for a prize of your choice",
    },
    isUnlocked: (c) => c.stats.pointExchanges >= 1,
  },
  {
    key: "special-gacha-single-ur",
    tier: 5,
    icon: "zap",
    isHidden: true,
    name: { ja: "奇跡の一枚", en: "Miracle Pull" },
    description: {
      ja: "1 回引きで UR を引く",
      en: "Pull a UR with a single pull",
    },
    isUnlocked: (c) => c.stats.singleUrs >= 1,
  },
  {
    key: "special-gacha-double-high",
    tier: 4,
    icon: "flame",
    isHidden: true,
    name: { ja: "神引き", en: "Divine Luck" },
    description: {
      ja: "1 回の 10 連で SSR 以上を 2 つ引く",
      en: "Get two SSR or better in one ten-pull",
    },
    isUnlocked: (c) => c.stats.bestTenHighCount >= 2,
  },
  {
    key: "special-gacha-set",
    tier: 2,
    icon: "link",
    isHidden: false,
    name: { ja: "おそろいコーデ", en: "Matching Set" },
    description: {
      ja: "SR 以上で、同じ名前のアイコン枠とヘッダー枠をそろえる",
      en: "Collect a matching SR+ icon frame and header frame",
    },
    isUnlocked: (c, pool) =>
      completedGachaSets(c, pool).some(
        (set) => gachaRarityRank(set.icon.rarity) >= gachaRarityRank("SR"),
      ),
  },
  {
    key: "special-gacha-exchange",
    tier: 1,
    icon: "repeat",
    isHidden: false,
    name: { ja: "かけら職人", en: "Shard Crafter" },
    description: {
      ja: "かぶりでたまったかけらで景品と交換する",
      en: "Exchange shards for a prize",
    },
    isUnlocked: (c) => c.stats.exchanges >= 1,
  },
  {
    key: "special-gacha-collect-half",
    tier: 3,
    icon: "library",
    isHidden: false,
    name: { ja: "コレクター", en: "Collector" },
    description: {
      ja: "ガチャの景品を半分そろえる",
      en: "Collect half of the gacha prizes",
    },
    isUnlocked: (c, pool) =>
      pool.length > 0 && ownedPrizeCount(c, pool) * 2 >= pool.length,
  },
  {
    key: "special-gacha-complete",
    tier: 6,
    icon: "crown",
    isHidden: false,
    name: { ja: "コンプリート", en: "Complete Collection" },
    description: {
      ja: "ガチャの景品を全部そろえる",
      en: "Collect every gacha prize",
    },
    isUnlocked: (c, pool) =>
      pool.length > 0 && ownedPrizeCount(c, pool) === pool.length,
  },
]

/** before のときは未達成で、after で達成したもの */
export const newlyUnlockedGachaAchievements = (
  before: GachaCollection,
  after: GachaCollection,
  pool: readonly GachaPrize[],
) =>
  GACHA_ACHIEVEMENTS.filter(
    (item) => !item.isUnlocked(before, pool) && item.isUnlocked(after, pool),
  )
