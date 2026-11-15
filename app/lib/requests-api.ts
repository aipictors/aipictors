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
  status: "ACTIVE" | "HIDDEN" | "DELETED"
  orderCount: number
  completedCount: number
  activeCount?: number
  createdAt: number
  updatedAt: number
}

export type RequestSettings = {
  userId: string
  acceptsFreeRequests: boolean
  minCoins: number
  allowsR18: boolean
  maxActive: number
  note: string
}

export type CreatorRequestProfile = {
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

/** エラーの日本語 */
export const requestErrorMessage = (error: unknown) => {
  const code = error instanceof RequestsApiError ? error.code : ""
  const messages: Record<string, string> = {
    INSUFFICIENT_COINS: "コインが足りません",
    SELF_REQUEST: "自分にはリクエストできません",
    PLAN_NOT_FOUND: "このプランは見つかりませんでした",
    NOT_ACCEPTING: "いまはリクエストを受け付けていません",
    PRICE_CHANGED: "プランの価格が変わりました。画面を更新してください",
    FULL: "受付の上限に達しています。しばらくしてからお試しください",
    TOO_MANY_PENDING: "このクリエイターへの承諾待ちのリクエストが多すぎます",
    BELOW_MINIMUM: "最低コインより少ない金額です",
    R18_NOT_ALLOWED: "このクリエイターは R18 のリクエストを受け付けていません",
    BLOCKED: "このユーザーにはリクエストできません",
    BODY_REQUIRED: "リクエストの内容を書いてください",
    INVALID_PRICE: "金額は 100〜100,000 コインで指定してください",
    INVALID_STATE: "状態が変わりました。画面を更新してください",
    NOT_OVERDUE: "納期を過ぎるまでキャンセルできません",
    NO_REVISIONS_LEFT: "修正の回数が残っていません",
    DELIVERY_REQUIRED: "納品する画像を選んでください",
    MESSAGE_REQUIRED: "メッセージを書いてください",
    TITLE_REQUIRED: "タイトルを入れてください",
    DESCRIPTION_REQUIRED: "説明を入れてください",
    TOO_MANY_PLANS: "プランは 20 個までです",
    DISABLED: "リクエストはいま停止中です",
    Unauthorized: "ログインしてください",
    REASON_REQUIRED: "理由を書いてください",
  }
  return messages[code] ?? "うまくいきませんでした。時間をおいてお試しください"
}

export const PLAN_CATEGORY_LABELS: Record<string, string> = {
  ILLUSTRATION: "イラスト",
  ICON: "アイコン",
  CHARACTER: "キャラクター",
  BACKGROUND: "背景",
  WALLPAPER: "壁紙",
  OTHER: "その他",
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING: "承諾待ち",
  ACCEPTED: "制作中",
  DELIVERED: "納品済み",
  COMPLETED: "完了",
  DECLINED: "お断り",
  CANCELED: "キャンセル",
  EXPIRED: "期限切れ",
  ADMIN_CANCELED: "運営がキャンセル",
  ADMIN_COMPLETED: "運営が完了",
}

export const REQUEST_FEE_RATE = 0.1

export const formatCoins = (n: number) => `${n.toLocaleString("ja-JP")}`

/** 残り時間（「あと 2 日」「あと 5 時間」「期限切れ」） */
export const formatRemaining = (unixSeconds: number | null) => {
  if (!unixSeconds) return ""
  const diff = unixSeconds - Math.floor(Date.now() / 1000)
  if (diff <= 0) return "期限を過ぎています"
  const days = Math.floor(diff / 86400)
  if (days >= 1) return `あと ${days} 日`
  const hours = Math.max(1, Math.floor(diff / 3600))
  return `あと ${hours} 時間`
}

export const formatDateTime = (unixSeconds: number | null) => {
  if (!unixSeconds) return ""
  const d = new Date(unixSeconds * 1000)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}
