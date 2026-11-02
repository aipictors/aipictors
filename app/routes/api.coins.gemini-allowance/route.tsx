import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getGeminiAllowanceFromApi } from "~/lib/server/coins-api.server"
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

/**
 * 今日の Gemini の枠（毎日のフリーコインから Gemini に使える量）
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const authorization = request.headers.get("authorization")
  const wpUserId = request.headers.get("wp-user-id")
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
    wpUserId,
  })

  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  try {
    const allowance = await getGeminiAllowanceFromApi({
      context,
      userId: viewer.userId,
    })

    return toJsonResponse({ error: null, data: allowance }, 200)
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch allowance",
        data: null,
      },
      502,
    )
  }
}
