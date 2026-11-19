/**
 * 推し（コイン付きのコメント・推し）の段階。YouTube のスーパーチャットのように、色が濃いほど長く上に出る。
 * フリーコインだけの推しは枚数に関係なくシルバー 1 色、プレミアムコインを含む推しはプレミアムの枚数で
 * 青 1〜・緑 500〜・黄 1,000〜・赤 3,000 枚〜（プレミアムは 100 枚単位で選ぶ）。
 * アプリ（lib/v2/core/support_tier.dart）と同じ区切り・同じ色にする
 */
export type SupportTierLevel = 0 | 1 | 2 | 3 | 4

export type SupportTier = {
  level: SupportTierLevel
  /** この段階になる最小のプレミアムコインの枚数（シルバーは 0 = フリーだけ） */
  minPremium: number
  /** コメント欄の上の「応援の帯」に出しておく時間（投稿からの時間） */
  pinSeconds: number
  /** 帯（見出し）の塗り。文字色も含む */
  bandClassName: string
  /** 本文の下地と枠 */
  bodyClassName: string
  /** 選んだ金額ボタン・小さなしるしの塗り */
  chipClassName: string
  /** 選んでいない金額ボタンの文字と枠 */
  outlineClassName: string
}

/** プレミアムコインで推すときの単位（この倍数だけ選べる） */
export const SUPPORT_PREMIUM_UNIT = 100

const HOUR = 60 * 60

export const SUPPORT_TIERS: readonly SupportTier[] = [
  {
    level: 0,
    minPremium: 0,
    pinSeconds: HOUR,
    bandClassName:
      "bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900",
    bodyClassName: "bg-slate-400/10 ring-slate-400/50",
    chipClassName:
      "bg-gradient-to-r from-slate-400 to-slate-300 text-slate-900",
    outlineClassName:
      "border-slate-400/60 text-slate-600 dark:text-slate-300 hover:bg-slate-400/10",
  },
  {
    level: 1,
    minPremium: 1,
    pinSeconds: 3 * HOUR,
    bandClassName: "bg-sky-600 text-white",
    bodyClassName: "bg-sky-500/10 ring-sky-500/40",
    chipClassName: "bg-sky-600 text-white",
    outlineClassName:
      "border-sky-500/50 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10",
  },
  {
    level: 2,
    minPremium: 500,
    pinSeconds: 12 * HOUR,
    bandClassName: "bg-emerald-600 text-white",
    bodyClassName: "bg-emerald-500/10 ring-emerald-500/40",
    chipClassName: "bg-emerald-600 text-white",
    outlineClassName:
      "border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10",
  },
  {
    level: 3,
    minPremium: 1000,
    pinSeconds: 24 * HOUR,
    bandClassName: "bg-amber-400 text-amber-950",
    bodyClassName: "bg-amber-400/15 ring-amber-500/50",
    chipClassName: "bg-amber-400 text-amber-950",
    outlineClassName:
      "border-amber-500/60 text-amber-700 dark:text-amber-300 hover:bg-amber-400/15",
  },
  {
    level: 4,
    minPremium: 3000,
    pinSeconds: 7 * 24 * HOUR,
    bandClassName: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
    bodyClassName: "bg-rose-500/10 ring-rose-500/60",
    chipClassName: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
    outlineClassName:
      "border-rose-500/60 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10",
  },
]

/** いちばん高い段階（光が横切る演出などに使う） */
export const SUPPORT_TOP_TIER_LEVEL = 4

type SupportCoins = { freeCoinAmount: number; premiumCoinAmount: number }

/** コインの枚数から段階を決める。どちらも 0 なら null（推しなし） */
export const getSupportTier = (
  support: SupportCoins | null | undefined,
): SupportTier | null => {
  if (!support) return null
  const free = Number.isFinite(support.freeCoinAmount)
    ? support.freeCoinAmount
    : 0
  const premium = Number.isFinite(support.premiumCoinAmount)
    ? support.premiumCoinAmount
    : 0
  if (premium <= 0) return free > 0 ? SUPPORT_TIERS[0] : null
  let found: SupportTier = SUPPORT_TIERS[1]
  for (const tier of SUPPORT_TIERS) {
    if (tier.minPremium > 0 && premium >= tier.minPremium) found = tier
  }
  return found
}

/** プレミアムコインで推せる最大の枚数（残高を 100 枚単位で切り捨て） */
export const toMaxPremiumSupport = (balance: number) =>
  Math.max(0, Math.floor(balance / SUPPORT_PREMIUM_UNIT) * SUPPORT_PREMIUM_UNIT)

export const toSupportPt = (
  freeCoinAmount: number,
  premiumCoinAmount: number,
) => Math.max(0, freeCoinAmount) + Math.max(0, premiumCoinAmount) * 10

/**
 * コメント欄の上に出しておく推しを選ぶ（読み込んだコメントだけで決める。問い合わせは増やさない）
 * 段階ごとの時間内のものを、段階の高い順・新しい順に最大 limit 件
 */
export const pickPinnedSupports = <
  T extends { createdAt: number; support?: SupportCoins | null },
>(
  comments: readonly T[],
  nowSeconds: number,
  limit = 10,
): T[] =>
  comments
    .map((comment) => ({
      comment,
      tier: getSupportTier(comment.support),
    }))
    .filter(
      (item): item is { comment: T; tier: SupportTier } =>
        item.tier !== null &&
        nowSeconds - item.comment.createdAt < item.tier.pinSeconds &&
        item.comment.createdAt <= nowSeconds + 60,
    )
    .sort(
      (a, b) =>
        b.tier.level - a.tier.level ||
        b.comment.createdAt - a.comment.createdAt,
    )
    .slice(0, limit)
    .map((item) => item.comment)

/** 推した作品がクリエイター報酬の対象になりうるか（全年齢＝G / R15 だけ） */
export const isCreatorRewardRating = (rating?: string | null) =>
  rating === "G" || rating === "R15"
