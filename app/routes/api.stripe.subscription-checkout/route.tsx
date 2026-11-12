import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { getApiBaseUrl, getInternalHeaders } from "~/lib/server/coins-api.server"
import { requireViewer } from "~/lib/server/viewer-api-route.server"

const PASS_TYPES = ["LITE", "STANDARD", "PREMIUM"] as const

/**
 * 年払いの決済画面と、ライトの 7 日間無料お試しの決済画面を作る（ふつうの月払いは GraphQL の createPassCheckoutSession のまま）
 * 加入中の人（アプリのストアでの加入も含む）は二重にならないように断る
 * お試しは body に { passType: "LITE", interval: "month", trial: true }。対象外は 409 で code: "trial_not_eligible"
 * （対象かどうかは先に GET /api/stripe/subscription-trial で分かる）
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
    trial?: unknown
  }
  const passType = PASS_TYPES.find((type) => type === input.passType)
  const isTrial = input.trial === true
  const isValid = isTrial
    ? passType === "LITE" && (input.interval === "month" || input.interval === undefined)
    : input.interval === "year"
  if (!passType || !isValid) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }
  if (viewer.currentPassType !== null) {
    return toJsonResponse(
      isTrial
        ? {
            error:
              "すでにプランに加入しています。無料お試しは、はじめてプランに入る方が 1 回だけ使えます。",
            code: "trial_not_eligible",
            reason: "has_subscription_history",
            data: null,
          }
        : {
            error:
              "すでにプランに加入しています。年払いへの切り替えは、今のプランの解約後にお申し込みください。",
            data: null,
          },
      409,
    )
  }

  const requestUrl = new URL(request.url)
  const origin = `${requestUrl.protocol}//${requestUrl.host}`
  const apiResponse = await fetch(
    `${getApiBaseUrl(context)}/stripe/checkout/subscription`,
    {
      method: "POST",
      headers: getInternalHeaders(context),
      body: JSON.stringify(
        isTrial
          ? { userId: viewer.userId, passType, interval: "month", trial: true, origin }
          : { userId: viewer.userId, passType, interval: "year", origin },
      ),
    },
  )
  const result = (await apiResponse.json().catch(() => null)) as {
    error?: string | null
    code?: string
    reason?: string
    data?: { url?: string }
  } | null
  // お試しの対象外（はじめてではない・使用済み・受付停止）は、理由をそのまま画面に返す
  if (apiResponse.status === 409 && result?.code === "trial_not_eligible") {
    return toJsonResponse(
      {
        error: result.error ?? "無料お試しの対象ではありません",
        code: result.code,
        reason: result.reason ?? null,
        data: null,
      },
      409,
    )
  }
  if (!apiResponse.ok || result?.error || !result?.data?.url) {
    return toJsonResponse(
      { error: result?.error ?? "決済画面を作れませんでした", data: null },
      502,
    )
  }
  return toJsonResponse({ error: null, data: { url: result.data.url } }, 200)
}
