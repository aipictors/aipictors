import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare"
import { verifyViewerFromGraphQL } from "~/lib/server/auth.server"
import {
  getApiBaseUrl,
  getInternalHeaders,
} from "~/lib/server/coins-api.server"
import { getServerEnvValue } from "~/lib/server/env.server"
import { toJsonResponse as toJson } from "~/lib/server/json-response.server"

/**
 * 管理画面: クリエイター報酬の振込（承認キュー）
 * GET  /api/admin/creator-payouts?status= → 参加者・報酬の合計と振込の一覧
 * POST /api/admin/creator-payouts { intent: "approve" | "cancel" | "close" | "send", payoutId?, mode?, reason?, period?, dryRun? }
 */
const requireModerator = async (request: Request, context: unknown) => {
  const authorization = request.headers.get("authorization")
  const graphqlEndpoint = getServerEnvValue(
    context,
    "VITE_GRAPHQL_ENDPOINT_REMIX",
  )
  if (!authorization?.startsWith("Bearer ") || !graphqlEndpoint) return null
  const viewer = await verifyViewerFromGraphQL({
    graphqlEndpoint,
    authorization,
    wpUserId: request.headers.get("wp-user-id"),
  })
  return viewer?.isModerator ? viewer : null
}

const forward = async (response: Response) =>
  new Response(await response.text(), {
    status: response.status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  })

export async function loader({ request, context }: LoaderFunctionArgs) {
  const viewer = await requireModerator(request, context)
  if (!viewer) return toJson({ error: "Forbidden", data: null }, 403)
  const status = new URL(request.url).searchParams.get("status") ?? ""
  return forward(
    await fetch(
      `${getApiBaseUrl(context)}/internal/creator-payouts/admin/overview${status ? `?status=${encodeURIComponent(status)}` : ""}`,
      { headers: getInternalHeaders(context) },
    ),
  )
}

export async function action({ request, context }: ActionFunctionArgs) {
  const viewer = await requireModerator(request, context)
  if (!viewer) return toJson({ error: "Forbidden", data: null }, 403)
  const body = (await request.json().catch(() => ({}))) as {
    intent?: string
    payoutId?: string
    mode?: "release" | "reverse"
    reason?: string
    period?: string
    dryRun?: boolean
  }
  const base = `${getApiBaseUrl(context)}/internal/creator-payouts/admin`
  const headers = getInternalHeaders(context)
  const post = (path: string, payload: Record<string, unknown>) =>
    fetch(`${base}/${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    }).then(forward)
  const payoutId = encodeURIComponent(body.payoutId ?? "")
  switch (body.intent) {
    case "approve":
      return post(`payouts/${payoutId}/approve`, {
        moderatorUserId: viewer.userId,
      })
    case "cancel":
      return post(`payouts/${payoutId}/cancel`, {
        moderatorUserId: viewer.userId,
        mode: body.mode === "reverse" ? "reverse" : "release",
        reason: body.reason ?? undefined,
      })
    case "close":
      return post("close", {
        period: body.period || undefined,
        dryRun: body.dryRun !== false,
      })
    case "send":
      return post("send", {})
    default:
      return toJson({ error: "Unknown intent", data: null }, 400)
  }
}
