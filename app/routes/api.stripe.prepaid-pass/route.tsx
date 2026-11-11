import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

export type PrepaidPassStatus = {
  pass: { passType: string; periodEnd: number } | null
  /** Stripe の PayPay の審査が通っていて、決済画面に PayPay が出るか */
  paypayAvailable: boolean
}

const PASS_TYPES = ["LITE", "STANDARD", "PREMIUM"] as const

/**
 * 自動更新なしのプラン（1 か月・1 年のパス）の状態（aipictors-api の lib/prepaid-pass.ts）
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  const result = await callAipictorsApi<PrepaidPassStatus>(
    context,
    `/stripe/checkout/prepaid-pass/status/${encodeURIComponent(viewer.userId)}`,
  )
  if (result.error || !result.data) {
    return toJsonResponse({ error: result.error ?? "Failed", data: null }, 502)
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}

/**
 * パスの決済画面（1 回払い。PayPay・カード）を作る
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
  const interval = input.interval === "year" ? "year" : input.interval === "month" ? "month" : null
  if (!passType || !interval) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }
  // アプリのストアでの加入は aipictors-api では分からないので、ここで断る（パスは aipictors-api 側で判定）
  if (viewer.currentPassType !== null && viewer.currentPassType !== passType) {
    return toJsonResponse(
      { error: "今のプランの期間が終わってから購入してください。", data: null },
      409,
    )
  }
  const requestUrl = new URL(request.url)
  const result = await callAipictorsApi<{ url: string }>(
    context,
    "/stripe/checkout/prepaid-pass",
    {
      method: "POST",
      body: {
        userId: viewer.userId,
        passType,
        interval,
        origin: `${requestUrl.protocol}//${requestUrl.host}`,
      },
    },
  )
  if (result.error || !result.data?.url) {
    return toJsonResponse(
      { error: result.error ?? "決済画面を作れませんでした", data: null },
      result.status === 409 ? 409 : 502,
    )
  }
  return toJsonResponse({ error: null, data: { url: result.data.url } }, 200)
}
