import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import type { PremiumCoinOffer } from "~/lib/premium-coins"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

/**
 * コイン購入の上乗せの判定（はじめての購入か・プラン加入中か）。購入画面の表示に使う
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  const result = await callAipictorsApi<PremiumCoinOffer>(
    context,
    `/stripe/checkout/premium-coins/offer/${encodeURIComponent(viewer.userId)}`,
  )
  if (result.error || !result.data) {
    return toJsonResponse({ error: result.error ?? "Failed", data: null }, 502)
  }
  return toJsonResponse(
    {
      error: null,
      // アプリのストアでの加入は aipictors-api では分からないので、GraphQL のプランも見る
      data: {
        isFirstPurchase: result.data.isFirstPurchase,
        passType: result.data.passType ?? viewer.currentPassType,
      },
    },
    200,
  )
}
