/**
 * コイン履歴の表示用の変換（文言・日付・まとめ）
 */

export type CoinType = "FREE" | "PREMIUM"

export type LedgerItem = {
  id: number
  coinType: CoinType
  delta: number
  kind: string
  reason: string | null
  source: string | null
  createdAt: number
}

export type LedgerFilter = "all" | "received" | "used" | "expired"

export type LedgerGroup = {
  key: string
  coinType: CoinType
  kind: string
  label: string
  count: number
  delta: number
  firstAt: number
  lastAt: number
}

export type LedgerDay = {
  dateKey: string
  at: number
  groups: LedgerGroup[]
}

type Translate = (ja: string, en: string) => string

const JST_OFFSET_SECONDS = 9 * 60 * 60
const SECONDS_PER_DAY = 24 * 60 * 60

/** JST の日付キー（YYYY-MM-DD） */
export const getJstDateKey = (unixSeconds: number) => {
  return new Date((unixSeconds + JST_OFFSET_SECONDS) * 1000)
    .toISOString()
    .slice(0, 10)
}

const isJstMidnight = (unixSeconds: number) => {
  return (unixSeconds + JST_OFFSET_SECONDS) % SECONDS_PER_DAY === 0
}

const pad = (value: number) => String(value).padStart(2, "0")

const toJstParts = (unixSeconds: number) => {
  const date = new Date((unixSeconds + JST_OFFSET_SECONDS) * 1000)
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    weekday: date.getUTCDay(),
  }
}

export const formatJstTime = (unixSeconds: number) => {
  const parts = toJstParts(unixSeconds)
  return `${pad(parts.hour)}:${pad(parts.minute)}`
}

/** 履歴の日付の見出し（今日・昨日、去年以前は年つき） */
export const formatLedgerDay = (
  unixSeconds: number,
  nowSeconds: number,
  t: Translate,
) => {
  const dateKey = getJstDateKey(unixSeconds)

  if (dateKey === getJstDateKey(nowSeconds)) {
    return t("今日", "Today")
  }

  if (dateKey === getJstDateKey(nowSeconds - SECONDS_PER_DAY)) {
    return t("昨日", "Yesterday")
  }

  const parts = toJstParts(unixSeconds)
  const now = toJstParts(nowSeconds)
  const weekday = t(
    ["日", "月", "火", "水", "木", "金", "土"][parts.weekday],
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][parts.weekday],
  )
  const date =
    parts.year === now.year
      ? `${parts.month}/${parts.day}`
      : `${parts.year}/${parts.month}/${parts.day}`

  return `${date} (${weekday})`
}

/**
 * 失効日時の表示。日付が変わる瞬間（00:00）は「その前の日の 24:00」として出す
 */
export const formatExpiry = (
  expiresAt: number,
  nowSeconds: number,
  t: Translate,
) => {
  const isMidnight = isJstMidnight(expiresAt)
  const dateSeconds = isMidnight ? expiresAt - 1 : expiresAt
  const dateKey = getJstDateKey(dateSeconds)
  const time = isMidnight ? "24:00" : formatJstTime(expiresAt)

  if (dateKey === getJstDateKey(nowSeconds)) {
    return `${t("今日", "Today")} ${time}`
  }

  if (dateKey === getJstDateKey(nowSeconds + SECONDS_PER_DAY)) {
    return `${t("明日", "Tomorrow")} ${time}`
  }

  const parts = toJstParts(dateSeconds)
  const now = toJstParts(nowSeconds)
  const date =
    parts.year === now.year
      ? `${parts.month}/${parts.day}`
      : `${parts.year}/${parts.month}/${parts.day}`

  return `${date} ${time}`
}

/** 履歴の 1 行の見出し。内部の識別子をそのまま見せない */
export const getLedgerLabel = (row: LedgerItem, t: Translate) => {
  const reason = row.reason ?? ""
  const source = row.source ?? ""

  if (row.kind === "EXPIRE") {
    return t("有効期限切れ", "Expired")
  }

  if (reason === "ADMIN_BULK_ADJUST") {
    return t("運営による調整", "Adjusted by the team")
  }

  if (reason === "image-generation:cancel-refund") {
    return t("生成キャンセルの返却", "Refund for canceled generation")
  }

  if (reason.startsWith("image-generation:")) {
    const type = reason.slice("image-generation:".length)

    if (type.startsWith("reserved:")) {
      return t("画像生成（予約）", "Image generation (reserved)")
    }
    if (
      type === "image_to_image" ||
      type === "inpainting" ||
      type === "img2img"
    ) {
      return t("画像修正", "Image modification")
    }
    if (type === "flux") {
      return t("画像生成（FLUX）", "Image generation (FLUX)")
    }
    if (type === "gemini-2.5-flash-image") {
      return t(
        "画像生成（Gemini Nano Banana）",
        "Image generation (Gemini Nano Banana)",
      )
    }
    if (type === "gemini-3.1-flash-image-preview") {
      return t(
        "画像生成（Gemini Nano Banana 2）",
        "Image generation (Gemini Nano Banana 2)",
      )
    }
    return t("画像生成", "Image generation")
  }

  if (reason === "work-comment-support") {
    return t("コメントで推した", "Supported in a comment")
  }

  if (reason === "coin support" || source.startsWith("profile-support:")) {
    return t("ユーザーを推した", "Supported a user")
  }

  if (reason === "coin support received") {
    return t("推してもらった", "Received support")
  }

  if (reason === "support rollback refund") {
    return t("推しの取り消しで返却", "Refund for canceled support")
  }

  if (
    reason === "premium-coin-purchase" ||
    reason === "premium-coin-webhook-backfill" ||
    reason === "Stripe checkout completed"
  ) {
    return t("プレミアムコインを購入", "Purchased premium coins")
  }

  const dailyGrant = reason.match(
    /^(FREE|LITE|STANDARD|PREMIUM) (?:daily|initial) generation coin grant$/,
  )

  if (dailyGrant) {
    return dailyGrant[1] === "FREE"
      ? t("毎日のコイン", "Daily coins")
      : t(`毎日のコイン（${dailyGrant[1]}）`, `Daily coins (${dailyGrant[1]})`)
  }

  // 実績の報酬やキャンペーンは、理由がそのまま読める日本語で入っている
  if (reason.length > 0 && !/^[ -~]+$/.test(reason)) {
    return reason
  }

  if (row.kind === "CONSUME") {
    return t("コインを使用", "Coins used")
  }

  return t("コインを受け取り", "Coins received")
}

export const matchesLedgerFilter = (row: LedgerItem, filter: LedgerFilter) => {
  if (filter === "all") return true
  if (filter === "expired") return row.kind === "EXPIRE"
  if (filter === "used") return row.kind === "CONSUME"
  return row.kind !== "EXPIRE" && row.kind !== "CONSUME"
}

/**
 * 日付ごとに分け、同じ内容が続く行は 1 行にまとめる（連続で生成すると同じ行が何十も並ぶため）。
 * rows は新しい順で渡す
 */
export const groupLedgerByDay = (
  rows: LedgerItem[],
  t: Translate,
): LedgerDay[] => {
  const days: LedgerDay[] = []

  for (const row of rows) {
    const dateKey = getJstDateKey(row.createdAt)
    let day = days[days.length - 1]

    if (day?.dateKey !== dateKey) {
      day = { dateKey, at: row.createdAt, groups: [] }
      days.push(day)
    }

    const label = getLedgerLabel(row, t)
    const last = day.groups[day.groups.length - 1]

    if (
      last &&
      last.coinType === row.coinType &&
      last.kind === row.kind &&
      last.label === label
    ) {
      last.count += 1
      last.delta += row.delta
      last.firstAt = row.createdAt
      continue
    }

    day.groups.push({
      key: String(row.id),
      coinType: row.coinType,
      kind: row.kind,
      label,
      count: 1,
      delta: row.delta,
      firstAt: row.createdAt,
      lastAt: row.createdAt,
    })
  }

  return days
}

/** 今日もらった・使った・失効した枚数（プレミアムも含む） */
export const getTodayLedgerStats = (rows: LedgerItem[], nowSeconds: number) => {
  const todayKey = getJstDateKey(nowSeconds)
  const stats = { received: 0, used: 0, expired: 0 }

  for (const row of rows) {
    if (getJstDateKey(row.createdAt) !== todayKey) continue

    if (row.kind === "CONSUME") {
      stats.used += Math.abs(row.delta)
    } else if (row.kind === "EXPIRE") {
      stats.expired += Math.abs(row.delta)
    } else if (row.delta > 0) {
      stats.received += row.delta
    }
  }

  return stats
}
