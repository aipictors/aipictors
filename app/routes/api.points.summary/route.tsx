import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  ensurePointsSchema,
  getUserPointsSummary,
} from "~/lib/server/points-d1.server"
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

  const db = (context as { cloudflare?: { env?: { POINTS_DB?: D1Database } } })
    .cloudflare?.env?.POINTS_DB

  if (!db) {
    return toJsonResponse({ error: "POINTS_DB is not configured", data: null }, 500)
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

  await ensurePointsSchema(db)

  const summary = await getUserPointsSummary({
    db,
    userId: viewer.userId,
    limit: 50,
  })

  return toJsonResponse(
    {
      error: null,
      data: {
        userId: viewer.userId,
        balance: summary.balance,
        ledger: summary.rows,
      },
    },
    200,
  )
}
