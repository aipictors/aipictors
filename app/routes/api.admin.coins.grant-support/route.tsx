/**
 * POST /api/admin/coins/grant-support
 *
 * 管理者専用: 指定ユーザーに支援受け取りコイン (source_kind = 'SUPPORT') を直接付与する。
 * 動作確認・テスト用途。
 *
 * body: { recipientUserId: string, coinType: "FREE" | "PREMIUM", amount: number }
 */
import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { boolean, number, object, optional, safeParse, string } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"

const bodySchema = object({
  recipientUserId: string(),
  coinType: string(),
  amount: number(),
  reason: optional(string()),
})

function toJson(body: unknown, status: number): Response {
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
    return toJson({ error: "Method not allowed", data: null }, 405)
  }

  const authorization = request.headers.get("authorization")
  const wpUserId = request.headers.get("wp-user-id")
  if (!authorization?.startsWith("Bearer ")) {
    return toJson({ error: "Unauthorized", data: null }, 401)
  }

  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  if (!graphqlEndpoint) {
    return toJson(
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
    return toJson({ error: "Unauthorized", data: null }, 401)
  }

  // モデレーターのみ許可
  if (!viewer.isModerator) {
    return toJson({ error: "Forbidden: moderator only", data: null }, 403)
  }

  const parsedBody = safeParse(bodySchema, await request.json())
  if (!parsedBody.success) {
    return toJson({ error: "Invalid request body", data: null }, 400)
  }

  const { recipientUserId, coinType, amount, reason } = parsedBody.output

  if (coinType !== "FREE" && coinType !== "PREMIUM") {
    return toJson(
      { error: 'coinType must be "FREE" or "PREMIUM"', data: null },
      400,
    )
  }

  if (!Number.isInteger(amount) || amount < 1) {
    return toJson(
      { error: "amount must be a positive integer", data: null },
      400,
    )
  }

  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken =
    getServerEnvValue(context, "AIPICTORS_API_INTERNAL_TOKEN") ??
    getServerEnvValue(context, "INTERNAL_API_TOKEN")

  if (!internalToken) {
    return toJson(
      { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
      500,
    )
  }

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/grant-support`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${internalToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientUserId,
        coinType,
        amount,
        reason: reason ?? `admin grant by ${viewer.userId}`,
      }),
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data: unknown
  }

  if (!apiResponse.ok || apiJson.error) {
    return toJson(
      { error: apiJson.error ?? "Backend error", data: null },
      apiResponse.status,
    )
  }

  return toJson({ error: null, data: apiJson.data }, 200)
}
