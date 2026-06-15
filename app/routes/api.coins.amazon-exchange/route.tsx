/**
 * Amazon ポイント交換申請 API
 * GET  /api/coins/amazon-exchange  → ユーザ自身の申請一覧
 * POST /api/coins/amazon-exchange  → 新規申請
 *
 * 同時申請上限: 3件（承認されるまで枠は回復しない）
 * パッケージ: 1,000コイン→300円 / 10,000コイン→3,000円
 */
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { object, safeParse, string } from "valibot"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import {
  AMAZON_EXCHANGE_PACKAGES,
  parseAmazonExchangePackageId,
} from "../../lib/server/amazon-exchange.server"

// ─── shared helpers ──────────────────────────────────────────────────────────

export type AmazonExchangeRequest = {
  id: string
  packageId: string
  coinAmount: number
  amazonPointYen: number
  status: "PENDING" | "APPROVED"
  amazonGiftCode: string | null
  appliedAt: number
  approvedAt: number | null
}

const bodySchema = object({
  packageId: string(),
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
const getInternalHeaders = (internalToken: string) => ({
  Authorization: `Bearer ${internalToken}`,
  "Content-Type": "application/json",
})

// ─── GET: 申請一覧 ────────────────────────────────────────────────────────────

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
    wpUserId: wpUserId ?? undefined,
  })
  if (!viewer) {
    return toJsonResponse({ error: "Unauthorized", data: null }, 401)
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

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/amazon-exchange?userId=${encodeURIComponent(viewer.userId)}`,
    {
      method: "GET",
      headers: getInternalHeaders(internalToken),
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: {
      requests: AmazonExchangeRequest[]
      pendingCount: number
      remainingSlots: number
    }
  }

  if (!apiResponse.ok || apiJson.error || !apiJson.data) {
    return toJsonResponse(
      {
        error: apiJson.error ?? "Failed to fetch exchange requests",
        data: null,
      },
      502,
    )
  }

  return toJsonResponse({ error: null, data: apiJson.data }, 200)
}

// ─── POST: 新規申請 ───────────────────────────────────────────────────────────

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

  const packageId = parseAmazonExchangePackageId(parsedBody.output.packageId)
  if (!packageId) {
    return toJsonResponse({ error: "Invalid packageId", data: null }, 400)
  }

  const pkg = AMAZON_EXCHANGE_PACKAGES[packageId]

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

  const apiResponse = await fetch(
    `${apiBaseUrl}/internal/coins/amazon-exchange`,
    {
      method: "POST",
      headers: getInternalHeaders(internalToken),
      body: JSON.stringify({
        userId: viewer.userId,
        packageId,
        coinAmount: pkg.coinAmount,
        amazonPointYen: pkg.amazonPointYen,
      }),
    },
  )

  const apiJson = (await apiResponse.json()) as {
    error: string | null
    data?: { requestId: string; pendingCount: number; remainingSlots: number }
  }

  if (!apiResponse.ok || apiJson.error || !apiJson.data) {
    return toJsonResponse(
      {
        error: apiJson.error ?? "Failed to submit exchange request",
        data: null,
      },
      apiResponse.status === 409 ? 409 : 502,
    )
  }

  return toJsonResponse({ error: null, data: apiJson.data }, 200)
}
