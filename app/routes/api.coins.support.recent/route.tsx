import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { getServerEnvValue } from "~/lib/server/env.server"

type RecentReceivedTransfer = {
  senderUser: UserSummary
  recipientUser: UserSummary
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

async function enrichRecentTransfers(
  items: RecentReceivedTransfer[],
): Promise<RecentReceivedTransfer[]> {
  const uniqueUserIds = Array.from(
    new Set(
      items.flatMap((item) => [item.senderUser.id, item.recipientUser.id]),
    ),
  )

  const users = await Promise.all(
    uniqueUserIds.map(async (userId) => {
      try {
        const response = await loaderClient.query({
          query: recentSupportUserQuery,
          variables: { userId },
          fetchPolicy: "no-cache",
        })

        return [userId, response.data.user] as const
      } catch {
        return [userId, null] as const
      }
    }),
  )

  const userMap = new Map(users)

  return items.map((item) => ({
    ...item,
    senderUser: {
      ...item.senderUser,
      login: userMap.get(item.senderUser.id)?.login ?? item.senderUser.login,
      name: userMap.get(item.senderUser.id)?.name ?? item.senderUser.name,
      iconUrl:
        userMap.get(item.senderUser.id)?.iconUrl ?? item.senderUser.iconUrl,
    },
    recipientUser: {
      ...item.recipientUser,
      login:
        userMap.get(item.recipientUser.id)?.login ?? item.recipientUser.login,
      name: userMap.get(item.recipientUser.id)?.name ?? item.recipientUser.name,
      iconUrl:
        userMap.get(item.recipientUser.id)?.iconUrl ?? item.recipientUser.iconUrl,
    },
  }))
}

const recentSupportUserQuery = graphql(
  `query RecentSupportUser($userId: ID!) {
    user(id: $userId) {
      id
      login
      name
      iconUrl
    }
  }`,
)

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
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
    `${apiBaseUrl}/internal/coins/support/recent?limit=${encodeURIComponent(limit.toString())}`,
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
      items?: RecentReceivedTransfer[]
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

  const items = Array.isArray(apiJson.data.items) ? apiJson.data.items : []

  return toJsonResponse(
    {
      error: null,
      data: {
        items: await enrichRecentTransfers(items),
      },
    },
    200,
  )
}
