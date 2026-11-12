import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { toReferralCode } from "~/lib/referral/referral-storage"
import { toJsonResponse } from "~/lib/server/json-response.server"
import { callAipictorsApi, requireViewer } from "~/lib/server/viewer-api-route.server"

export type ReferralAttachResult = {
  attached: boolean
  /** attached / already / unknown_code / self / not_new_account / same_device / same_ip / ip_overlap / not_ready / disabled */
  reason: string
  grantedCoins: number
  /** true のときだけ、あとでもう一度試してよい */
  retry?: boolean
}

/**
 * 紹介リンクから来て登録した人を、紹介コードにひも付ける（登録の特典のコインは API が付ける）
 * 新しく登録したアカウントかどうか・不正かどうかは API が確かめる
 */
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return toJsonResponse({ error: "Method not allowed", data: null }, 405)
  }
  const viewer = await requireViewer(request, context)
  if (viewer instanceof Response) return viewer

  const input = (await request.json().catch(() => ({}))) as {
    code?: unknown
    deviceId?: unknown
  }
  const code = toReferralCode(typeof input.code === "string" ? input.code : null)
  if (code === null) {
    return toJsonResponse({ error: "Invalid request body", data: null }, 400)
  }
  const result = await callAipictorsApi<ReferralAttachResult>(
    context,
    "/internal/referrals/attach",
    {
      method: "POST",
      body: {
        userId: viewer.userId,
        code,
        deviceId: typeof input.deviceId === "string" ? input.deviceId : null,
        ip: request.headers.get("cf-connecting-ip"),
      },
    },
  )
  if (result.error || !result.data) {
    return toJsonResponse(
      { error: result.error ?? "Failed to attach referral", data: null },
      502,
    )
  }
  return toJsonResponse({ error: null, data: result.data }, 200)
}
