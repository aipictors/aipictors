import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { object, string, number, safeParse, optional } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { applyPointsTransactionViaApi } from "~/lib/server/points-api.server"

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

  try {
    const summary = await applyPointsTransactionViaApi({
      context,
      userId: viewer.userId,
      type: body.type === "consume" ? "consume" : "grant",
      points,
      reason: body.reason ?? null,
    })

    return toJsonResponse(
      {
        error: null,
        data: {
          balance: summary.balance,
          ledger: summary.ledger,
        },
      },
      200,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update points"
    const status = message === "Insufficient points" ? 409 : 502
    return toJsonResponse({ error: message, data: null }, status)
  }
}
