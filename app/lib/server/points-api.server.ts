import { getServerEnvValue } from "~/lib/server/env.server"

type PointsSummary = {
  balance: number
  ledger: Array<Record<string, unknown>>
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
    throw new Error(json.error ?? `AIPICTORS API request failed: ${response.status}`)
  }

  return json.data
}

export const getPointsSummaryFromApi = async (props: {
  context: unknown
  userId: string
}) => {
  const response = await fetch(
    `${getApiBaseUrl(props.context)}/internal/points/${props.userId}`,
    {
      headers: getInternalHeaders(props.context),
    },
  )

  return parseApiResponse<PointsSummary>(response)
}

export const applyPointsTransactionViaApi = async (props: {
  context: unknown
  userId: string
  type: "grant" | "consume"
  points: number
  reason: string | null
}) => {
  const response = await fetch(
    `${getApiBaseUrl(props.context)}/internal/points/${props.type}`,
    {
      method: "POST",
      headers: {
        ...getInternalHeaders(props.context),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: props.userId,
        points: props.points,
        reason: props.reason ?? "",
      }),
    },
  )

  return parseApiResponse<PointsSummary>(response)
}

export const proxyStripeWebhookToApi = async (props: {
  context: unknown
  payload: string
  stripeSignature: string
}) => {
  return fetch(`${getApiBaseUrl(props.context)}/webhooks/stripe`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": props.stripeSignature,
      ...(() => {
        const headers: Record<string, string> = {}
        const cfAccessClientId = getServerEnvValue(
          props.context,
          "AIPICTORS_API_CF_ACCESS_CLIENT_ID",
        )
        const cfAccessClientSecret = getServerEnvValue(
          props.context,
          "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
        )

        if (cfAccessClientId && cfAccessClientSecret) {
          headers["CF-Access-Client-Id"] = cfAccessClientId
          headers["CF-Access-Client-Secret"] = cfAccessClientSecret
        }

        return headers
      })(),
    },
    body: props.payload,
  })
}