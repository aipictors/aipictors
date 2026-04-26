import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { object, string, number, safeParse, optional } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  addPointsTransaction,
  ensurePointsSchema,
  getUserPointsSummary,
} from "~/lib/server/points-d1.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const bodySchema = object({
  type: string(),
  points: number(),
  reason: optional(string()),
})

function toJsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
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

  const parsedBody = safeParse(bodySchema, await request.json())

  if (!parsedBody.success) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }

  const body = parsedBody.output
  const points = Math.floor(body.points)

  if (points <= 0) {
    return toJsonResponse({ error: "points must be > 0", data: null }, 400)
  }

  const kind = body.type === "consume" ? "CONSUME" : body.type === "grant" ? "GRANT" : null

  if (kind === null) {
    return toJsonResponse({ error: "Unsupported type", data: null }, 400)
  }

  await ensurePointsSchema(db)

  const delta = kind === "CONSUME" ? -points : points

  const writeResult = await addPointsTransaction({
    db,
    userId: viewer.userId,
    delta,
    kind,
    reason: body.reason ?? null,
  })

  if (!writeResult.ok && writeResult.code === "INSUFFICIENT_POINTS") {
    return toJsonResponse({ error: "Insufficient points", data: null }, 409)
  }

  const summary = await getUserPointsSummary({ db, userId: viewer.userId, limit: 20 })

  return toJsonResponse(
    {
      error: null,
      data: {
        balance: summary.balance,
        ledger: summary.rows,
      },
    },
    200,
  )
}
