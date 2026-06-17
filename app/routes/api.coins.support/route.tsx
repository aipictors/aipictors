import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { boolean, nullable, number, object, optional, safeParse, string } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

/**
 * コインで推しを送るAPI
 * POST /api/coins/support
 *
 * body: { recipientUserId: string, coinType: "FREE" | "PREMIUM", amount: number }
 *
 * - フリーコイン: 1pt / 枚
 * - プレミアムコイン: 10pt / 枚（PREMIUM_COIN_PT_MULTIPLIER）
 * - 推しランキング: 受け取ったptの合計でランキング
 * - 貢献度ランキング: 送ったptの合計でランキング
 * - 集計期間: 1週間ごと（月4回）
 */

const bodySchema = object({
  recipientUserId: string(),
  coinType: string(),
  amount: number(),
  isAnonymous: optional(boolean()),
  source: optional(nullable(string())),
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
    wpUserId: wpUserId ?? undefined,
  })

  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  const parsedBody = safeParse(bodySchema, await request.json())
  if (!parsedBody.success) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }

  const { recipientUserId, coinType, amount, isAnonymous, source } =
    parsedBody.output

  if (coinType !== "FREE" && coinType !== "PREMIUM") {
    return toJsonResponse(
      { error: 'coinType must be "FREE" or "PREMIUM"', data: null },
      400,
    )
  }

  if (!Number.isInteger(amount) || amount < 1) {
    return toJsonResponse(
      { error: "amount must be a positive integer", data: null },
      400,
    )
  }

  if (recipientUserId === viewer.userId) {
    return toJsonResponse({ error: "Cannot support yourself", data: null }, 400)
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

  const apiResponse = await fetch(`${apiBaseUrl}/internal/coins/support`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${internalToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderUserId: viewer.userId,
      recipientUserId,
      coinType,
      amount,
      isAnonymous: isAnonymous ?? false,
      planType: viewer.currentPassType ?? "FREE",
      source: source ?? null,
    }),
  })

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: {
      transferredAmount: number
      senderPtAdded: number
      recipientPtAdded: number
    }
  }

  if (!apiResponse.ok || apiJson.error || !apiJson.data) {
    return toJsonResponse(
      {
        error: apiJson.error ?? "Failed to process support transaction",
        data: null,
      },
      502,
    )
  }

  return toJsonResponse(
    {
      error: null,
      data: apiJson.data,
    },
    200,
  )
}
