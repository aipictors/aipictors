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
  const wpUserId = request.headers.get("wp-user-id")
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
    wpUserId,
  })

  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  try {
    const searchParams = new URL(request.url).searchParams
    const includeLedger = searchParams.get("includeLedger") === "1"
    const includeExpiringLots = searchParams.get("includeExpiringLots") === "1"
    const includeLedgerLimitRaw = searchParams.get("includeLedgerLimit")
    const includeLedgerOffsetRaw = searchParams.get("includeLedgerOffset")
    const includeLedgerLimit = includeLedgerLimitRaw
      ? Number.parseInt(includeLedgerLimitRaw, 10)
      : undefined
    const includeLedgerOffset = includeLedgerOffsetRaw
      ? Number.parseInt(includeLedgerOffsetRaw, 10)
      : undefined

    if (
      (includeLedgerLimitRaw && !Number.isFinite(includeLedgerLimit)) ||
      (includeLedgerOffsetRaw && !Number.isFinite(includeLedgerOffset))
    ) {
      return toJsonResponse({ error: "Invalid ledger paging", data: null }, 400)
    }

    const summary = await getCoinSummaryFromApi({
      context,
      userId: viewer.userId,
      currentPassType: viewer.currentPassType,
      includeLedger,
      includeExpiringLots,
      includeLedgerLimit,
      includeLedgerOffset,
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