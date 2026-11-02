/**
 * 実績の表示に使うもの（ランクの名前と色・種類の名前・バッジ画像）
 */

export type AchievementTierInfo = {
  ja: string
  en: string
  /** 文字色（Tailwind） */
  textClassName: string
  /** チップの背景（Tailwind） */
  chipClassName: string
  /** 光の色（演出に使う） */
  glow: string
}

export const ACHIEVEMENT_TIERS: Record<number, AchievementTierInfo> = {
  1: {
    ja: "ブロンズ",
    en: "Bronze",
    textClassName: "text-amber-700 dark:text-amber-500",
    chipClassName:
      "bg-gradient-to-r from-amber-700 to-orange-400 text-white shadow-amber-900/30",
    glow: "#e2a26b",
  },
  2: {
    ja: "シルバー",
    en: "Silver",
    textClassName: "text-slate-500 dark:text-slate-300",
    chipClassName:
      "bg-gradient-to-r from-slate-500 to-slate-300 text-white shadow-slate-900/30",
    glow: "#dbe3ea",
  },
  3: {
    ja: "ゴールド",
    en: "Gold",
    textClassName: "text-yellow-600 dark:text-yellow-400",
    chipClassName:
      "bg-gradient-to-r from-yellow-600 to-amber-300 text-yellow-950 shadow-yellow-900/30",
    glow: "#ffd34d",
  },
  4: {
    ja: "プラチナ",
    en: "Platinum",
    textClassName: "text-sky-700 dark:text-sky-200",
    chipClassName:
      "bg-gradient-to-r from-slate-400 via-sky-100 to-slate-400 text-slate-800 shadow-sky-900/30",
    glow: "#c9ecff",
  },
  5: {
    ja: "ダイヤモンド",
    en: "Diamond",
    textClassName: "text-cyan-600 dark:text-cyan-300",
    chipClassName:
      "bg-gradient-to-r from-blue-600 via-cyan-300 to-blue-600 text-white shadow-cyan-900/30",
    glow: "#7fe7ff",
  },
  6: {
    ja: "レジェンド",
    en: "Legend",
    textClassName:
      "bg-gradient-to-r from-pink-500 via-yellow-400 to-sky-400 bg-clip-text text-transparent",
    chipClassName:
      "bg-gradient-to-r from-pink-500 via-yellow-400 via-50% to-violet-500 text-white shadow-pink-900/30",
    glow: "#ffd166",
  },
  7: {
    ja: "神話",
    en: "Mythic",
    textClassName:
      "bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent",
    chipClassName:
      "bg-gradient-to-r from-indigo-950 via-violet-600 to-cyan-500 text-white shadow-violet-900/40",
    glow: "#a78bfa",
  },
}

export function getAchievementTier(tier: number): AchievementTierInfo {
  return (
    ACHIEVEMENT_TIERS[tier] ?? (ACHIEVEMENT_TIERS[1] as AchievementTierInfo)
  )
}

/** 種類の名前（実績ページの見出し） */
export const ACHIEVEMENT_SERIES_LABELS: Record<
  string,
  { ja: string; en: string }
> = {
  works: { ja: "作品を投稿する", en: "Post works" },
  "likes-received": { ja: "いいねをもらう", en: "Receive likes" },
  "views-received": { ja: "作品を見てもらう", en: "Get views" },
  followers: { ja: "フォロワーを増やす", en: "Gain followers" },
  awards: { ja: "ランキングに入賞する", en: "Win rankings" },
  themes: { ja: "お題に参加する", en: "Join daily themes" },
  generations: { ja: "画像を生成する", en: "Generate images" },
  "likes-given": { ja: "いいねで応援する", en: "Cheer with likes" },
  "views-given": { ja: "作品を見て回る", en: "Explore works" },
  "comments-given": { ja: "感想を書く", en: "Write comments" },
  following: { ja: "クリエイターをフォローする", en: "Follow creators" },
  "login-days": { ja: "ログインする", en: "Log in" },
  "login-streak": { ja: "毎日続けて来る", en: "Keep a streak" },
  "account-age": { ja: "Aipictors と過ごす", en: "Time with Aipictors" },
  "first-places": { ja: "ランキングで1位になる", en: "Take 1st place" },
  novels: { ja: "小説を投稿する", en: "Post novels" },
  series: { ja: "シリーズを作る", en: "Create series" },
  "stickers-created": { ja: "スタンプを作る", en: "Create stickers" },
  "bookmarks-received": { ja: "ブックマークされる", en: "Get bookmarked" },
  "post-days": { ja: "投稿した日を増やす", en: "Days you posted" },
  "post-streak": { ja: "毎日投稿を続ける", en: "Daily posting streak" },
  "achievements-unlocked": { ja: "実績を集める", en: "Collect achievements" },
  "achievement-level": { ja: "実績レベルを上げる", en: "Raise your level" },
  "supports-sent": { ja: "推し付きコメントを送る", en: "Send support" },
  "supports-received": {
    ja: "推し付きコメントをもらう",
    en: "Receive support",
  },
  "bookmarks-given": { ja: "ブックマークする", en: "Bookmark works" },
  "stickers-used": { ja: "スタンプを使う", en: "Use stickers" },
  "support-pt-sent": {
    ja: "推しコインで貢献する",
    en: "Contribute support coins",
  },
  "support-pt-received": {
    ja: "推しコインを受け取る",
    en: "Receive support coins",
  },
}

export const ACHIEVEMENT_CATEGORIES = [
  { value: "ALL", ja: "すべて", en: "All" },
  { value: "CREATE", ja: "創作", en: "Create" },
  { value: "COMMUNITY", ja: "閲覧・交流", en: "Community" },
  { value: "LOGIN", ja: "ログイン", en: "Login" },
  { value: "MASTERY", ja: "やり込み", en: "Mastery" },
  { value: "SPECIAL", ja: "特別", en: "Special" },
] as const

/**
 * バッジ画像の版。ブラウザに 1 日キャッシュされるので、同じ名前の画像を描き直したら上げる
 */
const BADGE_IMAGE_VERSION = 2

/** バッジ画像（隠し実績で未達成なら「?」） */
export function toAchievementBadgeUrl(props: {
  key: string
  isHidden: boolean
  isUnlocked: boolean
}) {
  // hidden- で始まるキーは、自分がまだ達成していない他の人の隠し実績
  if (
    (props.isHidden && !props.isUnlocked) ||
    props.key.startsWith("hidden-")
  ) {
    return `/achievements/badges/hidden.svg?v=${BADGE_IMAGE_VERSION}`
  }
  return `/achievements/badges/${props.key}.svg?v=${BADGE_IMAGE_VERSION}`
}

const CHECK_EVENT = "aipictors:achievement-check"

/**
 * 実績をすぐ確かめてもらう（投稿・いいね・フォローなどのあと）
 */
export function requestAchievementCheck() {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(CHECK_EVENT))
}

export function onAchievementCheckRequested(listener: () => void) {
  window.addEventListener(CHECK_EVENT, listener)
  return () => window.removeEventListener(CHECK_EVENT, listener)
}

/** 達成率の表示（0.123 → 12.3%） */
export function formatRarity(rarity: number | null | undefined) {
  if (rarity === null || rarity === undefined) return null
  const percent = rarity * 100
  if (percent < 0.1) return "<0.1%"
  if (percent < 10) return `${percent.toFixed(1)}%`
  return `${Math.round(percent)}%`
}
