import { getViewerRequestHeaders } from "~/lib/viewer-request-headers"

/**
 * ライトの 7 日間無料お試しの API（/api/stripe/subscription-trial、/api/stripe/subscription-checkout の trial）
 */
export type TrialRecordStatus =
  | "trialing"
  | "rejected_duplicate_card"
  | "rejected_repeat"
  | "converted"
  | "canceled"

export type TrialStatus = {
  isLoggedIn: boolean
  /** true: お試しできる / false: 対象外 / null: ログインするまで分からない */
  eligible: boolean | null
  reason: string | null
  trialDays: number
  passType: string
  priceYenAfterTrial: number
  latestTrial: {
    status: TrialRecordStatus | string
    /** お試しの終わり（UNIX 秒） */
    trialEnd: number
    createdAt: number
  } | null
}

/** 画面の文言（7 日間・その後 ¥480/月）と同じ内容のお試しか。違う内容に変わっていたら案内しない */
export const TRIAL_DAYS = 7
export const TRIAL_PRICE_YEN_AFTER = 480

export const isTrialAsAdvertised = (status: TrialStatus) =>
  status.trialDays === TRIAL_DAYS &&
  status.passType === "LITE" &&
  status.priceYenAfterTrial === TRIAL_PRICE_YEN_AFTER

/**
 * お試しの対象か・直近のお試しの状態を取る。取れなかったら null（今までの初月半額の案内のままにする）
 */
export async function fetchTrialStatus(): Promise<TrialStatus | null> {
  try {
    // 未ログインの人はヘッダーなしで聞く（受付を止めていないかだけ返る）
    const headers = await getViewerRequestHeaders({
      includeJsonContentType: true,
    }).catch((): Record<string, string> => ({}))
    const response = await fetch("/api/stripe/subscription-trial", {
      headers,
      cache: "no-store",
    })
    if (!response.ok) return null
    const json = (await response.json().catch(() => null)) as {
      error: string | null
      data: TrialStatus | null
    } | null
    if (!json || json.error || !json.data) return null
    if (typeof json.data.trialDays !== "number") return null
    return json.data
  } catch (_error) {
    return null
  }
}

export type TrialCheckoutResult =
  | { kind: "ok"; url: string }
  | { kind: "ineligible"; reason: string | null }
  | { kind: "error" }

/**
 * お試しの決済画面（Stripe）の URL を作る。対象外（409 trial_not_eligible）は ineligible で返す
 */
export async function createTrialCheckout(): Promise<TrialCheckoutResult> {
  const headers = await getViewerRequestHeaders({ includeJsonContentType: true })
  const response = await fetch("/api/stripe/subscription-checkout", {
    method: "POST",
    headers,
    body: JSON.stringify({ passType: "LITE", interval: "month", trial: true }),
  })
  const json = (await response.json().catch(() => null)) as {
    error: string | null
    code?: string
    reason?: string
    data: { url: string } | null
  } | null
  if (response.status === 409 && json?.code === "trial_not_eligible") {
    return { kind: "ineligible", reason: json.reason ?? null }
  }
  if (!response.ok || !json?.data?.url) return { kind: "error" }
  return { kind: "ok", url: json.data.url }
}
