import { getServerEnvValue } from "~/lib/server/env.server"

export type SupportRankingKind = "received" | "sent"
export type SupportRankingPeriod = "daily" | "weekly" | "monthly"

export type SupportRankingItem = {
  rank: number
  userId: string
  coinAmount: number
  ptAmount: number
  transferCount: number
  iconUrl?: string | null
  userName?: string | null
}

export type SupportPeriodRankingData = {
  kind: SupportRankingKind
  period: SupportRankingPeriod
  periodKey: string
  items: SupportRankingItem[]
  totalCount: number
  offset: number
  limit: number
}

export const fetchSupportPeriodRanking = async (props: {
  context: unknown
  kind: SupportRankingKind
  period: SupportRankingPeriod
  periodKey: string
  limit?: number
}) => {
  const apiBaseUrl =
    getServerEnvValue(props.context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken =
    getServerEnvValue(props.context, "AIPICTORS_API_INTERNAL_TOKEN") ??
    getServerEnvValue(props.context, "INTERNAL_API_TOKEN")

  if (!internalToken) {
    throw new Error("AIPICTORS_API_INTERNAL_TOKEN is not configured")
  }

  const query = new URLSearchParams({
    kind: props.kind,
    period: props.period,
    periodKey: props.periodKey,
    limit: String(props.limit ?? 100),
  })

  const response = await fetch(
    `${apiBaseUrl}/internal/coins/support/rankings-period?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
      },
    },
  )

  const json = (await response.json()) as {
    error: string | null
    data?: SupportPeriodRankingData
  }

  if (!response.ok || json.error || !json.data) {
    throw new Error(json.error ?? "Failed to fetch support rankings")
  }

  return {
    ...json.data,
    items: Array.isArray(json.data.items) ? json.data.items : [],
  }
}