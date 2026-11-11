import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

const PASS_TYPES = ["LITE", "STANDARD", "PREMIUM"] as const

/**
 * 年払いの決済画面を作る（月払いは GraphQL の createPassCheckoutSession のまま）
 * 加入中の人（アプリのストアでの加入も含む）は二重にならないように断る
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer

  const input = (await request.json().catch(() => ({}))) as {
    passType?: unknown
    interval?: unknown
  }
  const passType = PASS_TYPES.find((type) => type === input.passType)
  if (!passType || input.interval !== "year") {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }
  if (viewer.currentPassType !== null) {
    return toJsonResponse(
      {
        error:
          "すでにプランに加入しています。年払いへの切り替えは、今のプランの解約後にお申し込みください。",
        data: null,
      },
      409,
    )
  }

  const requestUrl = new URL(request.url)
  const result = await callAipictorsApi<{ url: string }>(
    context,
    "/stripe/checkout/subscription",
    {
      method: "POST",
      body: {
        userId: viewer.userId,
        passType,
        interval: "year",
        origin: `${requestUrl.protocol}//${requestUrl.host}`,
      },
    },
  )
  if (result.error || !result.data?.url) {
    return toJsonResponse(
      { error: result.error ?? "決済画面を作れませんでした", data: null },
      502,
    )
  }
  return toJsonResponse({ error: null, data: { url: result.data.url } }, 200)
}
