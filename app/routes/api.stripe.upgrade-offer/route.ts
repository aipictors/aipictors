import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import {
  callAipictorsApi,
  requireViewer,
} from "~/lib/server/viewer-api-route.server"

export type StandardUpgradeOffer = {
  offer: string
  passType: "STANDARD"
  eligible: boolean
  reason: string | null
  /** 初月の金額（円） */
  firstMonthYen: number
  /** 2 か月目からの月額（円） */
  regularYen: number
}

/**
 * ライトからスタンダードへ上げる人の初月割引（初月 ¥980）の対象か（aipictors-api の lib/standard-upgrade-offer.ts）
 * 表示用。割引を当てるかは、プラン変更のときに aipictors-api がもう一度決める
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer
  const result = await callAipictorsApi<StandardUpgradeOffer>(
    context,
    `/internal/subscriptions/upgrade-offer/${encodeURIComponent(viewer.userId)}`,
  )
  if (result.error || !result.data) {
    return toJsonResponse(
      { error: result.error ?? "Failed to fetch offer", data: null },
      502,
    )
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}
