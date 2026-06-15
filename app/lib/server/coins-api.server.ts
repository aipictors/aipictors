import { getServerEnvValue } from "~/lib/server/env.server"

type CoinSummary = {
  freeBalance: number
  premiumBalance: number
  totalBalance: number
  expiredFreeCoins: number
  expiredPremiumCoins: number
  events: Array<{
    kind: "GRANT" | "CONSUME" | "EXPIRE"
    message: string
    freeCoins: number
    premiumCoins: number
  }>
  ledger: Array<Record<string, unknown>>
  expiringLots: Array<{
    coinType: "FREE" | "PREMIUM"
    amount: number
    expiresAt: number
  }>
  granted: boolean
  grantedPlanType: string | null
  grantedFreeCoins: number
  grantedPremiumCoins: number
}

export type AdminCoinHistoryItem = {
  id: number
  userId: string
  coinType: "FREE" | "PREMIUM"
  delta: number
  kind: string
  reason: string | null
  source: string | null
  createdAt: number
  expiresAt: number | null
  runningFreeBalance: number
  runningPremiumBalance: number
  runningTotalBalance: number
}

export type AdminCoinHistoryLot = {
  id: number
  coinType: "FREE" | "PREMIUM"
  amount: number
  expiresAt: number | null
  createdAt: number
}

export type AdminCoinHistoryResult = {
  items: AdminCoinHistoryItem[]
  totalCount: number
  offset: number
  limit: number
  summary: {
    matchedUserCount: number
    freeGrantedTotal: number
    premiumGrantedTotal: number
    freeConsumedTotal: number
    premiumConsumedTotal: number
    freeExpiredTotal: number
    premiumExpiredTotal: number
  }
  currentBalance: {
    freeBalance: number
    premiumBalance: number
    totalBalance: number
  } | null
  expiringLots: AdminCoinHistoryLot[]
}

const getApiBaseUrl = (context: unknown) => {
  return (
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  )
}

const getRequiredInternalToken = (context: unknown) => {
  const token = getServerEnvValue(context, "AIPICTORS_API_INTERNAL_TOKEN")
  if (!token) {
    throw new Error("AIPICTORS_API_INTERNAL_TOKEN is not configured")
  }
  return token
}

const getInternalHeaders = (context: unknown) => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getRequiredInternalToken(context)}`,
    "Content-Type": "application/json",
  }

  const cfAccessClientId = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_ID",
  )
  const cfAccessClientSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )

  if (cfAccessClientId && cfAccessClientSecret) {
    headers["CF-Access-Client-Id"] = cfAccessClientId
    headers["CF-Access-Client-Secret"] = cfAccessClientSecret
  }

  return headers
}

const parseApiResponse = async <T>(response: Response) => {
  const json = (await response.json()) as {
    error: string | null
    data?: T
  }

  if (!response.ok || json.error || json.data === undefined) {
    throw new Error(
      json.error ?? `AIPICTORS API request failed: ${response.status}`,
    )
  }

  return json.data
}

export const getCoinSummaryFromApi = async (props: {
  context: unknown
  userId: string
  currentPassType: string | null
  includeLedger?: boolean
  includeExpiringLots?: boolean
}) => {
  const response = await fetch(
    `${getApiBaseUrl(props.context)}/internal/coins/ensure-initial-grant`,
    {
      method: "POST",
      headers: getInternalHeaders(props.context),
      body: JSON.stringify({
        userId: props.userId,
        planType: props.currentPassType ?? "FREE",
        includeLedger: props.includeLedger ?? false,
        includeExpiringLots: props.includeExpiringLots ?? false,
      }),
    },
  )

  return parseApiResponse<CoinSummary>(response)
}

export const getAdminCoinHistoryFromApi = async (props: {
  context: unknown
  userId?: string | null
  from?: number | null
  to?: number | null
  offset?: number
  limit?: number
}) => {
  const searchParams = new URLSearchParams()

  if (props.userId?.trim()) {
    searchParams.set("userId", props.userId.trim())
  }

  if (typeof props.from === "number" && Number.isFinite(props.from)) {
    searchParams.set("from", String(Math.floor(props.from)))
  }

  if (typeof props.to === "number" && Number.isFinite(props.to)) {
    searchParams.set("to", String(Math.floor(props.to)))
  }

  if (typeof props.offset === "number" && Number.isFinite(props.offset)) {
    searchParams.set("offset", String(Math.max(0, Math.floor(props.offset))))
  }

  if (typeof props.limit === "number" && Number.isFinite(props.limit)) {
    searchParams.set("limit", String(Math.max(1, Math.floor(props.limit))))
  }

  const response = await fetch(
    `${getApiBaseUrl(props.context)}/internal/coins/admin-history?${searchParams.toString()}`,
    {
      method: "GET",
      headers: getInternalHeaders(props.context),
    },
  )

  return parseApiResponse<AdminCoinHistoryResult>(response)
}