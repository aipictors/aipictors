import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/**
 * 有料リクエストとプランの API（/api/requests）。画面はすべてここを通す
 */

export type RequestPlan = {
  id: string
  userId: string
  title: string
  description: string
  category: string
  sampleImageUrls: string[]
  priceCoins: number
  deliveryDays: number
  imageCount: number
  revisionCount: number
  maxActive: number
  isAccepting: boolean
  allowsR18: boolean
  /** プレミアムコインだけで受け付ける（フリーコインでは申し込めない） */
  premiumOnly: boolean
  status: "ACTIVE" | "HIDDEN" | "DELETED"
  orderCount: number
  completedCount: number
  activeCount?: number
  createdAt: number
  updatedAt: number
}

/** リクエストを払うコイン（1 つの依頼はどちらか一方） */
export type RequestCoinType = "FREE" | "PREMIUM"

export type RequestSettings = {
  userId: string
  acceptsFreeRequests: boolean
  minCoins: number
  allowsR18: boolean
  /** 自由リクエストをプレミアムコインだけで受け付ける */
  premiumOnly: boolean
  maxActive: number
  note: string
}

/** 実績（依頼者が公開を許可した完了済みの依頼）。画像は透かし入りのものだけ */
export type RequestShowcaseItem = {
  requestId: string
  planId: string | null
  planTitle: string | null
  creatorUserId: string
  imageUrls: string[]
  /** R18 の依頼（一覧は年齢の確認のあとに r18=1 で読む） */
  isR18?: boolean
  completedAt: number | null
}

export type CreatorRequestProfile = {
  /** 新しい実績（12 件まで）と全部の数 */
  showcase?: RequestShowcaseItem[]
  showcaseCount?: number
  /** R18 の実績の数（中身は年齢の確認のあとに読む） */
  showcaseR18Count?: number
  plans: RequestPlan[]
  settings: RequestSettings
  activeCount: number
  freeRequestActiveCount: number
  completedCount: number
  canFreeRequest: boolean
}

export type RequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "DELIVERED"
  | "COMPLETED"
  | "DECLINED"
  | "CANCELED"
  | "EXPIRED"
  | "ADMIN_CANCELED"
  | "ADMIN_COMPLETED"

export type RequestMessage = {
  id: string
  senderUserId: string | null
  body: string
  imageUrls: string[]
  createdAt: number
}

export type CoinRequest = {
  id: string
  planId: string | null
  planTitle: string | null
  requesterUserId: string
  creatorUserId: string
  role: "REQUESTER" | "CREATOR" | "ADMIN"
  title: string
  body: string
  referenceImageUrls: string[]
  isR18: boolean
  priceCoins: number
  deliveryDays: number
  revisionLeft: number
  escrow: { freeCoins: number; premiumCoins: number; paidCoins: number } | null
  status: RequestStatus
  respondBy: number
  dueAt: number | null
  autoCompleteAt: number | null
  acceptedAt: number | null
  deliveredAt: number | null
  deliveryMessage: string | null
  deliveryImageUrls: string[]
  deliveredWorkId: string | null
  completedAt: number | null
  closedReason: string | null
  closedAt: number | null
  settlement: {
    feeCoins: number
    earnedCoins: number
    earnedYen: number
    freeCoins: number
    premiumCoins: number
  } | null
  reportCount?: number
  /** 依頼者が実績として公開を許可した（透かし入り・全年齢の依頼だけ） */
  showcaseAllowed?: boolean
  /** クリエイターが自分の実績に出さないことにした */
  showcaseHidden?: boolean
  /** 透かし入りの画像（null = まだ作っていない） */
  showcaseImageUrls?: string[] | null
  createdAt: number
  updatedAt: number
  messages?: RequestMessage[]
}

export class RequestsApiError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code)
  }
}

const parse = async <T>(response: Response): Promise<T> => {
  const json = (await response.json().catch(() => null)) as {
    error: string | null
    data: T
  } | null
  if (!response.ok || !json || json.error) {
    throw new RequestsApiError(
      json?.error ?? `HTTP_${response.status}`,
      response.status,
    )
  }
  return json.data
}

export const requestsGet = async <T>(
  params: Record<string, string | number | boolean | null | undefined>,
): Promise<T> => {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === "") continue
    search.set(key, String(value))
  }
  const headers = await getViewerRequestHeaders().catch(() => ({}))
  return parse<T>(
    await fetch(`/api/requests?${search.toString()}`, { headers }),
  )
}

export const requestsPost = async <T>(
  body: Record<string, unknown>,
): Promise<T> => {
  const headers = await getViewerRequestHeaders({
    includeJsonContentType: true,
  })
  return parse<T>(
    await fetch("/api/requests", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }),
  )
}

/** エラーの文言（isEnglish で英語） */
export const requestErrorMessage = (error: unknown, isEnglish = false) => {
  const code = error instanceof RequestsApiError ? error.code : ""
  const messages: Record<string, { ja: string; en: string }> = {
    INSUFFICIENT_COINS: { ja: "コインが足りません", en: "Not enough coins" },
    PREMIUM_ONLY: {
      ja: "このリクエストはプレミアムコインのみで受け付けています",
      en: "This creator only accepts premium coins for this request",
    },
    SELF_REQUEST: {
      ja: "自分にはリクエストできません",
      en: "You cannot send a request to yourself",
    },
    PLAN_NOT_FOUND: {
      ja: "このプランは見つかりませんでした",
      en: "This plan could not be found",
    },
    NOT_ACCEPTING: {
      ja: "いまはリクエストを受け付けていません",
      en: "Not accepting requests right now",
    },
    PRICE_CHANGED: {
      ja: "プランの価格が変わりました。画面を更新してください",
      en: "The plan price has changed. Please reload the page",
    },
    FULL: {
      ja: "受付の上限に達しています。しばらくしてからお試しください",
      en: "The request limit has been reached. Please try again later",
    },
    TOO_MANY_PENDING: {
      ja: "このクリエイターへの承諾待ちのリクエストが多すぎます",
      en: "You have too many pending requests to this creator",
    },
    BELOW_MINIMUM: {
      ja: "最低コインより少ない金額です",
      en: "The amount is below the minimum coins",
    },
    R18_NOT_ALLOWED: {
      ja: "このクリエイターは R18 のリクエストを受け付けていません",
      en: "This creator does not accept R18 requests",
    },
    BLOCKED: {
      ja: "このユーザーにはリクエストできません",
      en: "You cannot send a request to this user",
    },
    BODY_REQUIRED: {
      ja: "リクエストの内容を書いてください",
      en: "Please describe your request",
    },
    INVALID_PRICE: {
      ja: "金額は 100〜100,000 コインで指定してください",
      en: "The amount must be between 100 and 100,000 coins",
    },
    INVALID_STATE: {
      ja: "状態が変わりました。画面を更新してください",
      en: "The status has changed. Please reload the page",
    },
    NOT_OVERDUE: {
      ja: "納期を過ぎるまでキャンセルできません",
      en: "You cannot cancel until the due date has passed",
    },
    NO_REVISIONS_LEFT: {
      ja: "修正の回数が残っていません",
      en: "No revisions left",
    },
    DELIVERY_REQUIRED: {
      ja: "納品する画像を選んでください",
      en: "Please select images to deliver",
    },
    MESSAGE_REQUIRED: {
      ja: "メッセージを書いてください",
      en: "Please write a message",
    },
    TITLE_REQUIRED: {
      ja: "タイトルを入れてください",
      en: "Please enter a title",
    },
    DESCRIPTION_REQUIRED: {
      ja: "説明を入れてください",
      en: "Please enter a description",
    },
    TOO_MANY_PLANS: {
      ja: "プランは 20 個までです",
      en: "You can have up to 20 plans",
    },
    DISABLED: {
      ja: "リクエストはいま停止中です",
      en: "Requests are currently paused",
    },
    Unauthorized: { ja: "ログインしてください", en: "Please log in" },
    REASON_REQUIRED: {
      ja: "理由を書いてください",
      en: "Please enter a reason",
    },
  }
  const pair = messages[code] ?? {
    ja: "うまくいきませんでした。時間をおいてお試しください",
    en: "Something went wrong. Please try again later",
  }
  return isEnglish ? pair.en : pair.ja
}

const PLAN_CATEGORY_TEXT: Record<string, { ja: string; en: string }> = {
  ILLUSTRATION: { ja: "イラスト", en: "Illustration" },
  ICON: { ja: "アイコン", en: "Icon" },
  CHARACTER: { ja: "キャラクター", en: "Character" },
  BACKGROUND: { ja: "背景", en: "Background" },
  WALLPAPER: { ja: "壁紙", en: "Wallpaper" },
  OTHER: { ja: "その他", en: "Other" },
}

const pickLabels = <K extends string>(
  text: Record<K, { ja: string; en: string }>,
  lang: "ja" | "en",
) =>
  Object.fromEntries(
    Object.entries<{ ja: string; en: string }>(text).map(([key, value]) => [
      key,
      value[lang],
    ]),
  ) as Record<K, string>

export const PLAN_CATEGORY_LABELS = pickLabels(PLAN_CATEGORY_TEXT, "ja")

export const PLAN_CATEGORY_LABELS_EN = pickLabels(PLAN_CATEGORY_TEXT, "en")

/** カテゴリの表示名（未知のカテゴリはそのまま） */
export const planCategoryLabel = (category: string, isEnglish = false) =>
  (isEnglish ? PLAN_CATEGORY_LABELS_EN : PLAN_CATEGORY_LABELS)[category] ??
  category

const REQUEST_STATUS_TEXT: Record<RequestStatus, { ja: string; en: string }> = {
  PENDING: { ja: "承諾待ち", en: "Pending" },
  ACCEPTED: { ja: "制作中", en: "In progress" },
  DELIVERED: { ja: "納品済み", en: "Delivered" },
  COMPLETED: { ja: "完了", en: "Completed" },
  DECLINED: { ja: "お断り", en: "Declined" },
  CANCELED: { ja: "キャンセル", en: "Canceled" },
  EXPIRED: { ja: "期限切れ", en: "Expired" },
  ADMIN_CANCELED: { ja: "運営がキャンセル", en: "Canceled by staff" },
  ADMIN_COMPLETED: { ja: "運営が完了", en: "Completed by staff" },
}

export const REQUEST_STATUS_LABELS = pickLabels(REQUEST_STATUS_TEXT, "ja")

export const REQUEST_STATUS_LABELS_EN = pickLabels(REQUEST_STATUS_TEXT, "en")

export const requestStatusLabel = (status: RequestStatus, isEnglish = false) =>
  (isEnglish ? REQUEST_STATUS_LABELS_EN : REQUEST_STATUS_LABELS)[status] ??
  status

export const REQUEST_FEE_RATE = 0.1

export const formatCoins = (n: number, isEnglish = false) =>
  `${n.toLocaleString(isEnglish ? "en-US" : "ja-JP")}`

/** 残り時間（「あと 2 日」「あと 5 時間」「期限切れ」） */
export const formatRemaining = (
  unixSeconds: number | null,
  isEnglish = false,
) => {
  if (!unixSeconds) return ""
  const pick = (text: { ja: string; en: string }) =>
    isEnglish ? text.en : text.ja
  const diff = unixSeconds - Math.floor(Date.now() / 1000)
  if (diff <= 0) return pick({ ja: "期限を過ぎています", en: "Past due" })
  const days = Math.floor(diff / 86400)
  if (days >= 1) {
    return pick({
      ja: `あと ${days} 日`,
      en: `${days} ${days === 1 ? "day" : "days"} left`,
    })
  }
  const hours = Math.max(1, Math.floor(diff / 3600))
  return pick({
    ja: `あと ${hours} 時間`,
    en: `${hours} ${hours === 1 ? "hour" : "hours"} left`,
  })
}

export const formatDateTime = (unixSeconds: number | null) => {
  if (!unixSeconds) return ""
  const d = new Date(unixSeconds * 1000)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}
