import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

type RecentReceivedTransfer = {
  senderUserId: string
  coinType: "FREE" | "PREMIUM"
  coinAmount: number
  ptAmount: number
  createdAt: number
}

type UserSummary = {
  id: string
  login: string | null
  name: string | null
  iconUrl: string | null
}

type RecentSupportHistoryItem = {
  senderUser: UserSummary
  recipientUser: UserSummary
  coinType: "FREE" | "PREMIUM"
  coinAmount: number
  ptAmount: number
  createdAt: number
}

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

const fallbackUser = (userId: string): UserSummary => ({
  id: userId,
  login: null,
  name: null,
  iconUrl: null,
})

async function fetchUsersByIds(userIds: string[]) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)))

  const users = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const response = await loaderClient.query({
          query: userSummaryQuery,
          variables: { userId },
          fetchPolicy: "no-cache",
        })

        const user = response.data.user
        return [
          userId,
          user
            ? {
                id: user.id,
                login: user.login,
                name: user.name,
                iconUrl: user.iconUrl,
              }
            : fallbackUser(userId),
        ] as const
      } catch {
        return [userId, fallbackUser(userId)] as const
      }
    }),
  )

  return new Map(users)
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }

  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )

  if (!graphqlEndpoint) {
    return toJsonResponse(
      { error: "VITE_GRAPHQL_ENDPOINT_REMIX is not configured", data: null },
      500,
    )
  }

  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
  })

  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken =
    getServerEnvValue(context, "AIPICTORS_API_INTERNAL_TOKEN") ??
    getServerEnvValue(context, "INTERNAL_API_TOKEN")

  if (!internalToken) {
    return toJsonResponse(
      { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
      500,
    )
  }

  const requestUrl = new URL(request.url)
  const requestedLimit = Number.parseInt(
    requestUrl.searchParams.get("limit") ?? "3",
    10,
  )
  const limit = Number.isNaN(requestedLimit)
    ? 3
    : Math.min(10, Math.max(1, requestedLimit))

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/support/summary/${encodeURIComponent(viewer.userId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
      },
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: {
      recentReceivedTransfers?: RecentReceivedTransfer[]
    }
  }

  if (!apiResponse.ok || apiJson.error || !apiJson.data) {
    return toJsonResponse(
      {
        error: apiJson.error ?? "Failed to fetch recent support history",
        data: null,
      },
      502,
    )
  }

  const rawItems = Array.isArray(apiJson.data.recentReceivedTransfers)
    ? apiJson.data.recentReceivedTransfers
    : []

  const items = rawItems.slice(0, limit)
  const userMap = await fetchUsersByIds([
    viewer.userId,
    ...items.map((item) => item.senderUserId),
  ])

  const recipientUser =
    userMap.get(viewer.userId) ?? fallbackUser(viewer.userId)

  const normalizedItems: RecentSupportHistoryItem[] = items.map((item) => ({
    senderUser:
      userMap.get(item.senderUserId) ?? fallbackUser(item.senderUserId),
    recipientUser,
    coinType: item.coinType,
    coinAmount: item.coinAmount,
    ptAmount: item.ptAmount,
    createdAt: item.createdAt,
  }))

  return toJsonResponse(
    {
      error: null,
      data: {
        items: normalizedItems,
      },
    },
    200,
  )
}

const userSummaryQuery = graphql(
  `query RecentSupportHistoryUserSummary($userId: ID!) {
    user(id: $userId) {
      id
      login
      name
      iconUrl
    }
  }`,
)
