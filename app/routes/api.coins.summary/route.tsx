import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { createCoinNotificationsViaGraphQL } from "~/lib/server/coin-notification.server"
import { getCoinSummaryFromApi } from "~/lib/server/coins-api.server"
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

  try {
    const includeLedger = new URL(request.url).searchParams.get("includeLedger") === "1"
    const summary = await getCoinSummaryFromApi({
      context,
      userId: viewer.userId,
      currentPassType: viewer.currentPassType,
      includeLedger,
    })

    if (summary.events.length > 0) {
      await createCoinNotificationsViaGraphQL({
        graphqlEndpoint,
        authorization,
        events: summary.events,
      }).catch(() => undefined)
    }

    return toJsonResponse({ error: null, data: summary }, 200)
  } catch (error) {
    return toJsonResponse(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch coins",
        data: null,
      },
      502,
    )
  }
}