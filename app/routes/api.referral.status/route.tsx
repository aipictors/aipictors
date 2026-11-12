import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi } from "~/lib/server/viewer-api-route.server"

export type ReferralStatus = {
  /** 紹介特典を受け付けているか（aipictors-api の var REFERRAL_ENABLED） */
  enabled: boolean
  rewards: { signup: number; action: number; paid: number }
  coinTtlDays: number
  monthlyLimit: number
}

/**
 * 紹介特典を受け付けているか（未ログインの人の画面にも出すので、ログインは要らない。利用者ごとの内容は返さない）
 */
export async function loader({ context }: LoaderFunctionArgs) {
  const result = await callAipictorsApi<ReferralStatus>(
    context,
    "/internal/referrals/status",
  )
  if (result.error || !result.data) {
    return toJsonResponse(
      { error: result.error ?? "Failed to fetch referral status", data: null },
      502,
    )
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}
