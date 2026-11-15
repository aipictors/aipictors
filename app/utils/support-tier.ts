/**
 * 推し（コイン付きのコメント・推し）の段階。YouTube のスーパーチャットのように、
 * pt（フリー 1 枚 = 1pt・プレミアム 1 枚 = 10pt）が大きいほど色が濃く・長く上に出る。
 * アプリ（lib/v2/core/support_tier.dart）と同じ区切り・同じ色にする
 */
export type SupportTierLevel = 1 | 2 | 3 | 4 | 5 | 6

export type SupportTier = {
  level: SupportTierLevel
  /** この段階になる最小の pt */
  minPt: number
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

const HOUR = 60 * 60

export const SUPPORT_TIERS: readonly SupportTier[] = [
  {
    level: 1,
    minPt: 1,
    pinSeconds: HOUR,
    bandClassName: "bg-sky-600 text-white",
    bodyClassName: "bg-sky-500/10 ring-sky-500/40",
    chipClassName: "bg-sky-600 text-white",
    outlineClassName:
      "border-sky-500/50 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10",
  },
  {
    level: 2,
    minPt: 20,
    pinSeconds: 3 * HOUR,
    bandClassName: "bg-teal-600 text-white",
    bodyClassName: "bg-teal-500/10 ring-teal-500/40",
    chipClassName: "bg-teal-600 text-white",
    outlineClassName:
      "border-teal-500/50 text-teal-700 dark:text-teal-300 hover:bg-teal-500/10",
  },
  {
    level: 3,
    minPt: 50,
    pinSeconds: 12 * HOUR,
    bandClassName: "bg-emerald-600 text-white",
    bodyClassName: "bg-emerald-500/10 ring-emerald-500/40",
    chipClassName: "bg-emerald-600 text-white",
    outlineClassName:
      "border-emerald-500/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10",
  },
  {
    level: 4,
    minPt: 100,
    pinSeconds: 24 * HOUR,
    bandClassName: "bg-amber-400 text-amber-950",
    bodyClassName: "bg-amber-400/15 ring-amber-500/50",
    chipClassName: "bg-amber-400 text-amber-950",
    outlineClassName:
      "border-amber-500/60 text-amber-700 dark:text-amber-300 hover:bg-amber-400/15",
  },
  {
    level: 5,
    minPt: 300,
    pinSeconds: 3 * 24 * HOUR,
    bandClassName: "bg-orange-600 text-white",
    bodyClassName: "bg-orange-500/10 ring-orange-500/50",
    chipClassName: "bg-orange-600 text-white",
    outlineClassName:
      "border-orange-500/60 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10",
  },
  {
    level: 6,
    minPt: 1000,
    pinSeconds: 7 * 24 * HOUR,
    bandClassName: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
    bodyClassName: "bg-rose-500/10 ring-rose-500/60",
    chipClassName: "bg-gradient-to-r from-rose-600 to-red-600 text-white",
    outlineClassName:
      "border-rose-500/60 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10",
  },
]

/** pt から段階を決める。0 以下は null（推しなし） */
export const getSupportTier = (totalPt: number): SupportTier | null => {
  if (!Number.isFinite(totalPt) || totalPt <= 0) return null
  let found: SupportTier = SUPPORT_TIERS[0]
  for (const tier of SUPPORT_TIERS) {
    if (totalPt >= tier.minPt) found = tier
  }
  return found
}

export const toSupportPt = (
  freeCoinAmount: number,
  premiumCoinAmount: number,
) => Math.max(0, freeCoinAmount) + Math.max(0, premiumCoinAmount) * 10

/**
 * コメント欄の上に出しておく推しを選ぶ（読み込んだコメントだけで決める。問い合わせは増やさない）
 * 段階ごとの時間内のものを、段階の高い順・新しい順に最大 limit 件
 */
export const pickPinnedSupports = <
  T extends { createdAt: number; support?: { totalPt: number } | null },
>(
  comments: readonly T[],
  nowSeconds: number,
  limit = 10,
): T[] =>
  comments
    .map((comment) => ({
      comment,
      tier: getSupportTier(comment.support?.totalPt ?? 0),
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
