import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

export type SubscriptionPause = {
  passType: string | null
  pausedFrom: number
  resumesAt: number
  nextBillingAt: number
} | null

/**
 * 1 か月休止の状態（aipictors-api の lib/subscription-pause.ts）
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  const result = await callAipictorsApi<SubscriptionPause>(
    context,
    `/internal/subscriptions/pause/${encodeURIComponent(viewer.userId)}`,
  )
  if (result.error) {
    return toJsonResponse({ error: result.error, data: null }, 502)
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}

/**
 * POST: 休止する（reason は解約の理由と同じ値・任意） / DELETE: 休止を取り消す
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST" && request.method !== "DELETE") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer

  if (request.method === "DELETE") {
    const result = await callAipictorsApi(context, "/internal/subscriptions/unpause-current", {
      method: "POST",
      body: { userId: viewer.userId },
    })
    if (result.error) {
      return toJsonResponse({ error: result.error, data: null }, result.status >= 400 ? result.status : 502)
    }
    return toJsonResponse({ error: null, data: null }, 200)
  }

  const input = (await request.json().catch(() => ({}))) as { reason?: unknown }
  const result = await callAipictorsApi<SubscriptionPause>(
    context,
    "/internal/subscriptions/pause-current",
    {
      method: "POST",
      body: {
        userId: viewer.userId,
        reason: typeof input.reason === "string" ? input.reason : null,
      },
    },
  )
  if (result.error) {
    return toJsonResponse({ error: result.error, data: null }, result.status >= 400 ? result.status : 502)
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}
