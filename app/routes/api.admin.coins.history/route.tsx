import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getAdminCoinHistoryFromApi } from "~/lib/server/coins-api.server"
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

const parseOptionalInt = (value: string | null) => {
  if (!value) {
    return null
  }

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  if (request.method !== "GET") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }

  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(context, "VITE_GRAPHQL_ENDPOINT_REMIX")
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

  if (!viewer.isModerator) {
    return toJsonResponse({ error: "Forbidden", data: null }, 403)
  }

  try {
    const url = new URL(request.url)
    const result = await getAdminCoinHistoryFromApi({
      context,
      userId: url.searchParams.get("userId"),
      from: parseOptionalInt(url.searchParams.get("from")),
      to: parseOptionalInt(url.searchParams.get("to")),
      offset: parseOptionalInt(url.searchParams.get("offset")) ?? 0,
      limit: parseOptionalInt(url.searchParams.get("limit")) ?? 100,
    })

    return toJsonResponse({ error: null, data: result }, 200)
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch admin coin history",
        data: null,
      },
      502,
    )
  }
}