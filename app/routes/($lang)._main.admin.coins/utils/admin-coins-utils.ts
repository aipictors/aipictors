export const pageDescription =
  "全ユーザ、プラン別ユーザ、または指定ユーザIDに対してコインを一括で付与・減少します。"

export type OperationType = "GRANT" | "REDUCE"
export type TargetScope = "ALL" | "PLAN" | "USER_IDS"
export type PlanType = "FREE" | "TWO_DAYS" | "LITE" | "STANDARD" | "PREMIUM"
export type ExchangeStatusFilter = "PENDING" | "APPROVED" | "REFLECTED"

/** adminAdjustCoins の結果 */
export type AdminAdjustCoinsResult = {
  targetCount: number
  changedCount: number
  freeGrantedTotal: number
  premiumGrantedTotal: number
  freeReducedTotal: number
  premiumReducedTotal: number
}

export type AdminCoinOperationHistory = {
  id: string
  createdAt: number
  moderatorUserId: string
  targetScope: TargetScope
  planType: string | null
  targetUserIds: string[]
  targetCount: number
  changedCount: number
  freeDelta: number
  premiumDelta: number
  freeGrantedTotal: number
  premiumGrantedTotal: number
  freeReducedTotal: number
  premiumReducedTotal: number
  expiresAt: number | null
}

export type AmazonExchangeAdminRequest = {
  id: string
  userId: string
  packageId: string
  coinAmount: number
  amazonPointYen: number
  status: "PENDING" | "APPROVED"
  amazonGiftCode: string | null
  appliedAt: number
  approvedAt: number | null
}

export type AmazonExchangeAdminListData = {
  requests: AmazonExchangeAdminRequest[]
  totalCount: number
}

export const planOptions: Array<{ value: PlanType; label: string }> = [
  { value: "FREE", label: "無料ユーザ" },
  { value: "TWO_DAYS", label: "2日プラン" },
  { value: "LITE", label: "ライトプラン" },
  { value: "STANDARD", label: "スタンダードプラン" },
  { value: "PREMIUM", label: "プレミアムプラン" },
]

export const jstDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

export const parseUserIdsText = (value: string) => {
  return Array.from(
    new Set(
      value
        .split(/[\s,、]+/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  )
}

export const formatTargetScope = (
  scope: TargetScope,
  planType: string | null,
) => {
  if (scope === "ALL") {
    return "全ユーザ"
  }

  if (scope === "USER_IDS") {
    return "ユーザID指定"
  }

  switch (planType) {
    case "FREE":
      return "無料ユーザ"
    case "TWO_DAYS":
      return "2日プラン"
    case "LITE":
      return "ライトプラン"
    case "STANDARD":
      return "スタンダードプラン"
    case "PREMIUM":
      return "プレミアムプラン"
    default:
      return "プラン別"
  }
}

export const formatDelta = (freeDelta: number, premiumDelta: number) => {
  const parts: string[] = []

  if (freeDelta !== 0) {
    parts.push(`フリー ${freeDelta > 0 ? "+" : ""}${freeDelta}`)
  }

  if (premiumDelta !== 0) {
    parts.push(`プレミアム ${premiumDelta > 0 ? "+" : ""}${premiumDelta}`)
  }

  return parts.length > 0 ? parts.join(" / ") : "0"
}

/** 交換申請の一覧のうち、選んだ状態のものだけ */
export const filterExchangeRequests = (
  exchangeRequests: AmazonExchangeAdminRequest[],
  exchangeStatusFilter: ExchangeStatusFilter,
) =>
  exchangeRequests.filter((request) => {
    if (exchangeStatusFilter === "PENDING") {
      return request.status === "PENDING"
    }

    if (exchangeStatusFilter === "APPROVED") {
      return request.status === "APPROVED"
    }

    return (request.amazonGiftCode?.trim().length ?? 0) > 0
  })
