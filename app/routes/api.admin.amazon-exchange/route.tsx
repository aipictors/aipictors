/**
 * 管理者向け Amazon ギフト券交換申請 API
 * GET  /api/admin/amazon-exchange          → 申請一覧（全ユーザ）
 * POST /api/admin/amazon-exchange/:id/approve → コード入力→承認
 *
 * Remix では path params が使えないので POST body に requestId を含める
 */
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { object, safeParse, string } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { createCoinNotificationForUserViaGraphQL } from "~/lib/server/coin-notification.server"
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

const getInternalHeaders = (
  internalToken: string,
  cfId: string | null | undefined,
  cfSecret: string | null | undefined,
) => ({
  Authorization: `Bearer ${internalToken}`,
  "Content-Type": "application/json",
  ...(cfId && cfSecret
    ? { "CF-Access-Client-Id": cfId, "CF-Access-Client-Secret": cfSecret }
    : {}),
})

const getEnv = (context: unknown) => {
  const apiBaseUrl =
    getServerEnvValue(context, "AIPICTORS_API_BASE_URL") ??
    "https://backend.aipictors.com"
  const internalToken = getServerEnvValue(
    context,
    "AIPICTORS_API_INTERNAL_TOKEN",
  )
  const cfId = getServerEnvValue(context, "AIPICTORS_API_CF_ACCESS_CLIENT_ID")
  const cfSecret = getServerEnvValue(
    context,
    "AIPICTORS_API_CF_ACCESS_CLIENT_SECRET",
  )
  return { apiBaseUrl, internalToken, cfId, cfSecret }
}

const requireModerator = async (
  request: Request,
  context: unknown,
): Promise<{ userId: string } | Response> => {
  const authorization = request.headers.get("authorization")
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
  })
  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
  }

  if (!viewer.isModerator) {
    return toJsonResponse({ error: "Forbidden", data: null }, 403)
  }

  return { userId: viewer.userId }
}

// ─── GET: 管理者向け申請一覧 ──────────────────────────────────────────────────

export async function loader({ request, context }: LoaderFunctionArgs) {
  const auth = await requireModerator(request, context)
  if (auth instanceof Response) return auth

  const { apiBaseUrl, internalToken, cfId, cfSecret } = getEnv(context)
  if (!internalToken) {
    return toJsonResponse(
      { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
      500,
    )
  }

  const url = new URL(request.url)
  const status = url.searchParams.get("status") ?? "PENDING"
  const offset = url.searchParams.get("offset") ?? "0"
  const limit = url.searchParams.get("limit") ?? "50"

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/amazon-exchange/admin?status=${encodeURIComponent(status)}&offset=${offset}&limit=${limit}`,
    {
      method: "GET",
      headers: getInternalHeaders(internalToken, cfId, cfSecret),
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: unknown
  }

  if (!apiResponse.ok || apiJson.error) {
    return toJsonResponse(
      { error: apiJson.error ?? "Failed to fetch requests", data: null },
      502,
    )
  }

  return toJsonResponse({ error: null, data: apiJson.data }, 200)
}

// ─── POST: 承認（Amazonギフトコード入力） ────────────────────────────────────

const approveBodySchema = object({
  requestId: string(),
  amazonGiftCode: string(),
})

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }

  const auth = await requireModerator(request, context)
  if (auth instanceof Response) return auth

  const parsedBody = safeParse(approveBodySchema, await request.json())
  if (!parsedBody.success) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }

  const { requestId, amazonGiftCode } = parsedBody.output
  const authorization = request.headers.get("authorization")

  if (!amazonGiftCode.trim()) {
    return toJsonResponse(
      { error: "amazonGiftCode is required", data: null },
      400,
    )
  }

  const { apiBaseUrl, internalToken, cfId, cfSecret } = getEnv(context)
  if (!internalToken) {
    return toJsonResponse(
      { error: "AIPICTORS_API_INTERNAL_TOKEN is not configured", data: null },
      500,
    )
  }

  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/amazon-exchange/${encodeURIComponent(requestId)}/approve`,
    {
      method: "POST",
      headers: getInternalHeaders(internalToken, cfId, cfSecret),
      body: JSON.stringify({
        amazonGiftCode: amazonGiftCode.trim(),
        moderatorUserId: auth.userId,
      }),
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: unknown
  }

  if (!apiResponse.ok || apiJson.error) {
    return toJsonResponse(
      { error: apiJson.error ?? "Failed to approve request", data: null },
      502,
    )
  }

  const approvedRequest = apiJson.data as {
    userId?: string
    amazonPointYen?: number
  } | null

  let notificationSent = false

  if (
    graphqlEndpoint &&
    authorization?.startsWith("Bearer ") &&
    approvedRequest?.userId
  ) {
    const amountLabel =
      typeof approvedRequest.amazonPointYen === "number"
        ? `${approvedRequest.amazonPointYen}円分`
        : "Amazonギフト券"

    try {
      await createCoinNotificationForUserViaGraphQL({
        graphqlEndpoint,
        authorization,
        targetUserId: approvedRequest.userId,
        message: `${amountLabel}の交換申請が承認されました。ギフトコードをご確認ください。`,
      })
      notificationSent = true
    } catch {
      notificationSent = false
    }
  }

  return toJsonResponse(
    {
      error: null,
      data: {
        ...(approvedRequest ?? {}),
        notificationSent,
      },
    },
    200,
  )
}
