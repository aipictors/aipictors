import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

/**
 * パスの決済が終わったら反映する（決済後の /plus/success から呼ぶ。webhook でも反映されるので、どちらが先でもよい）
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  const input = (await request.json().catch(() => ({}))) as { sessionId?: unknown }
  if (typeof input.sessionId !== "string" || !input.sessionId.startsWith("cs_")) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }
  const result = await callAipictorsApi<{
    reflected: boolean
    periodEnd?: number
    passType?: string
    paymentStatus?: string | null
  }>(context, "/stripe/checkout/prepaid-pass/confirm", {
    method: "POST",
    body: { userId: viewer.userId, sessionId: input.sessionId },
  })
  if (result.error || !result.data) {
    return toJsonResponse({ error: result.error ?? "Failed", data: null }, 502)
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}
