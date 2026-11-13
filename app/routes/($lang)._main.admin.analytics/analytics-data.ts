/**
 * 分析ページの日別の数字（aipictors-api の analytics_daily と同じ形）と、表示用の集計
 */

export type PlanCounts = { LITE: number; STANDARD: number; PREMIUM: number }

export type RankedItem = { name: string; count: number }

/** 国別の件数（合計と日本。countries は上位だけ） */
export type CountryTotals = { total: number; jp: number }

/** 利用者（サイト本体の DB から数える） */
export type UserCounts = {
  /** 新規登録と、その時点までの累計（退会を除く） */
  registered: { new: number; total: number }
  /** 投稿かいいねをした人 */
  active: number
  posters: number
  likers: number
  posts: number
  likes: number
}

export type UsersMonth = UserCounts & { month: string; updatedAt: number }

export type AnalyticsDay = {
  day: string
  updatedAt: number
  subscriptions: {
    active: PlanCounts
    started: PlanCounts
    ended: number
  } | null
  coins: {
    orders: number
    yen: number
    buyers: number
    refunded: number
  } | null
  generations: { results: number; users: number } | null
  stripe: {
    gross: number
    fee: number
    net: number
    refunds: number
    charges: number
  } | null
  cloudflare: {
    requests: number
    pageViews: number
    uniques: number
    bytes: number
    referers: RankedItem[]
    countries: RankedItem[]
    pv: {
      total: number
      landings: number
      bySource: Record<string, number>
      bySection: Record<string, number>
      /** ブラウザで開いた人の表示の国別（2026/11/06 から） */
      byCountry?: (CountryTotals & { countries: RankedItem[] }) | null
      /** うちログイン中の表示 */
      loggedIn?: CountryTotals | null
    }
    /** その日の訪問者（ブラウザ数）。計測に印を付けた日から */
    visitors?:
      | (CountryTotals & {
          countries: RankedItem[]
          loggedIn: CountryTotals
          weekFirst: CountryTotals
          monthFirst: CountryTotals
          newcomers: CountryTotals
        })
      | null
  } | null
  users?:
    | (UserCounts & {
        /** ログインしてサイトを開いた人（その日・7 日・30 日） */
        login: { dau: number; wau: number; mau: number } | null
      })
    | null
  costs?: {
    fxUsdJpy: number
    jpy: number
    items: Partial<Record<CostKey, { jpy: number; usd?: number }>>
    errors: string[]
  } | null
  errors: string[]
}

export type CostKey = "cloudflare" | "runpod" | "google" | "openai" | "xai"

export const COST_KEYS: CostKey[] = [
  "runpod",
  "cloudflare",
  "google",
  "xai",
  "openai",
]

export const COST_LABELS: Record<CostKey, string> = {
  runpod: "RunPod（生成 GPU）",
  cloudflare: "Cloudflare",
  google: "Google（Gemini）",
  openai: "OpenAI",
  xai: "xAI（Grok）",
}

/** aipictors-api の /internal/analytics/pnl */
export type ProfitAndLoss = {
  at: number
  today: {
    day: string
    revenue: number
    costs: Record<CostKey, number>
    costTotal: number
    profit: number
    fxUsdJpy: number
    errors: string[]
  }
  month: {
    from: string
    revenue: number
    costs: Record<CostKey, number>
    costTotal: number
    profit: number
    elapsedDays: number
    daysInMonth: number
    daysWithCosts: number
    storedDays: number
    projectedProfit: number | null
  }
  recent?: {
    days: number
    dailyProfit: number | null
    monthlyProfit: number | null
  }
}

export type AnalyticsResponse = {
  days: AnalyticsDay[]
  current: { subscriptions: PlanCounts; at: number }
  pnl?: ProfitAndLoss | null
  /** 利用者の月別（サービス開始から） */
  months?: UsersMonth[] | null
}

/** Web（Stripe）の月額。App Store は別料金だが件数が少ないので同じ額で見積もる */
export const PLAN_MONTHLY_YEN: PlanCounts = {
  LITE: 480,
  STANDARD: 1980,
  PREMIUM: 3980,
}

export const PLAN_LABELS: Record<keyof PlanCounts, string> = {
  LITE: "ライト",
  STANDARD: "スタンダード",
  PREMIUM: "プレミアム",
}

export const SOURCE_LABELS: Record<string, string> = {
  direct: "直接（ブックマーク・アプリなど）",
  google: "Google",
  yahoo: "Yahoo!",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  x: "X（Twitter）",
  discord: "Discord",
  pixiv: "pixiv",
  dlsite: "DLsite",
  ai: "AI チャット",
  other: "その他のサイト",
  unknown: "不明",
}

export const SECTION_LABELS: Record<string, string> = {
  top: "トップ",
  post: "作品（全年齢）",
  r_post: "作品（R18）",
  r: "R18 一覧",
  generation: "生成",
  search: "タグ・検索",
  ranking: "ランキング",
  plus: "プラン",
  event: "イベント・お題",
  model: "モデル",
  app: "投稿・設定など",
  other: "その他",
}

export const monthlyRevenue = (counts: PlanCounts) =>
  counts.LITE * PLAN_MONTHLY_YEN.LITE +
  counts.STANDARD * PLAN_MONTHLY_YEN.STANDARD +
  counts.PREMIUM * PLAN_MONTHLY_YEN.PREMIUM

export const sumBy = (
  days: AnalyticsDay[],
  pick: (day: AnalyticsDay) => number | undefined | null,
) => days.reduce((total, day) => total + (pick(day) ?? 0), 0)

/** 日ごとの { 名前: 件数 } を合計して多い順に */
export const mergeCounts = (
  days: AnalyticsDay[],
  pick: (
    day: AnalyticsDay,
  ) => Record<string, number> | RankedItem[] | undefined | null,
): RankedItem[] => {
  const totals = new Map<string, number>()
  for (const day of days) {
    const value = pick(day)
    if (!value) continue
    const entries = Array.isArray(value)
      ? value.map((item) => [item.name, item.count] as const)
      : Object.entries(value)
    for (const [name, count] of entries) {
      totals.set(name, (totals.get(name) ?? 0) + count)
    }
  }
  return [...totals.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/** 国コード（JP など）→ 日本語の国名 */
export const countryName = (code: string) => {
  try {
    return (
      new Intl.DisplayNames(["ja"], { type: "region" }).of(
        code.toUpperCase(),
      ) ?? code
    )
  } catch {
    return code
  }
}

export const formatPercent = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "-"

export const formatYen = (value: number) =>
  `¥${Math.round(value).toLocaleString("ja-JP")}`

export const formatCount = (value: number) =>
  Math.round(value).toLocaleString("ja-JP")

/** 前の同じ長さの期間と比べた増減（前が 0 なら null） */
export const changeRate = (current: number, previous: number) =>
  previous > 0 ? (current - previous) / previous : null
