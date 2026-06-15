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