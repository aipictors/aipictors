import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

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

  const authorization = request.headers.get("authorization")
  const wpUserId = request.headers.get("wp-user-id")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse(
      {
        error: null,
        data: {
          weeklySentCoinAmount: 0,
          weeklyReceivedCoinAmount: 0,
          cumulativeSentCoins: 0,
          cumulativeReceivedCoins: 0,
        },
      },
      200,
    )
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
    wpUserId: wpUserId ?? undefined,
  })

  if (!viewer) {
    return toJsonResponse(
      {
        error: null,
        data: {
          weeklySentCoinAmount: 0,
          weeklyReceivedCoinAmount: 0,
          cumulativeSentCoins: 0,
          cumulativeReceivedCoins: 0,
        },
      },
      200,
    )
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

  const url = new URL(request.url)
  const query = url.search ? url.search : ""

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/support/summary${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
        "x-viewer-user-id": viewer.userId,
      },
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: unknown
  }

  if (!apiResponse.ok || apiJson.error || !apiJson.data) {
    return toJsonResponse(
      { error: apiJson.error ?? "Failed to fetch support summary", data: null },
      502,
    )
  }

  return toJsonResponse({ error: null, data: apiJson.data }, 200)
}