import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

export type ReferralSummary = {
  /** 紹介特典を受け付けているか（止めている間も、これまでの人数とコインは返す） */
  enabled?: boolean
  code: string
  rewards: { signup: number; action: number; paid: number }
  coinTtlDays: number
  monthlyLimit: number
  monthlyUsed: number
  invitedCount: number
  actionCount: number
  paidCount: number
  coinsEarned: number
  wasReferred: boolean
}

/**
 * 紹介ページの内容（自分の紹介コード・これまでの紹介人数・受け取ったコイン）
 * 端末の ID と IP は、自分で自分を紹介するのを弾くために API に渡す（IP は API 側でハッシュにして持つ）
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer

  const input = (await request.json().catch(() => ({}))) as { deviceId?: unknown }
  const result = await callAipictorsApi<ReferralSummary>(
    context,
    "/internal/referrals/summary",
    {
      method: "POST",
      body: {
        userId: viewer.userId,
        deviceId: typeof input.deviceId === "string" ? input.deviceId : null,
        ip: request.headers.get("cf-connecting-ip"),
      },
    },
  )
  if (result.error || !result.data) {
    return toJsonResponse(
      { error: result.error ?? "Failed to fetch referral summary", data: null },
      502,
    )
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}
