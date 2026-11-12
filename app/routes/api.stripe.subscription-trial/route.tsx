import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

type TrialOffer = {
  eligible: boolean
  reason: "has_subscription_history" | "trial_used" | "disabled" | null
  trialDays: number
  passType: "LITE"
  priceYenAfterTrial: number
  latestTrial: {
    status:
      | "trialing"
      | "converted"
      | "canceled"
      | "rejected_duplicate_card"
      | "rejected_repeat"
    trialEnd: number | null
    createdAt: number
  } | null
}

/**
 * ライトの 7 日間無料お試しの対象かを返す（決済画面は POST /api/stripe/subscription-checkout に trial: true）
 * - 未ログイン: isLoggedIn: false、eligible: null（ログインするまで分からない。受付を止めているときだけ false）
 * - ログイン中: eligible と、対象外の理由（reason）。latestTrial は直近のお試しの状態で、
 *   同じカードを別の人が使っていて解約されたとき（rejected_duplicate_card）を決済後の画面が知るのに使う
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const isLoggedIn = request.headers.get("authorization")?.startsWith("Bearer ") === true
  if (!isLoggedIn) {
    // 受付中かどうかと日数・料金だけを聞く
    const result = await callAipictorsApi<TrialOffer>(context, "/stripe/checkout/trial/anonymous")
    if (result.error || !result.data) {
      return toJsonResponse({ error: result.error ?? "Failed to fetch trial offer", data: null }, 502)
    }
    return toJsonResponse(
      {
        error: null,
        data: {
          isLoggedIn: false,
          eligible: result.data.reason === "disabled" ? false : null,
          reason: result.data.reason === "disabled" ? "disabled" : "not_logged_in",
          trialDays: result.data.trialDays,
          passType: result.data.passType,
          priceYenAfterTrial: result.data.priceYenAfterTrial,
          latestTrial: null,
        },
      },
      200,
    )
  }
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer

  const result = await callAipictorsApi<TrialOffer>(
    context,
    `/stripe/checkout/trial/${encodeURIComponent(viewer.userId)}`,
  )
  if (result.error || !result.data) {
    return toJsonResponse({ error: result.error ?? "Failed to fetch trial offer", data: null }, 502)
  }
  // 今プランに入っている人（アプリのストアでの加入など、こちらの記録に無いものも含む）は対象外
  const hasCurrentPass = viewer.currentPassType !== null
  return toJsonResponse(
    {
      error: null,
      data: {
        isLoggedIn: true,
        ...result.data,
        eligible: result.data.eligible && !hasCurrentPass,
        reason:
          result.data.eligible && hasCurrentPass
            ? "has_subscription_history"
            : result.data.reason,
      },
    },
    200,
  )
}
