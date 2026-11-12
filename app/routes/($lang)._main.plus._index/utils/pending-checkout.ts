import type { BillingInterval } from "~/routes/($lang)._main.plus._index/utils/plan-specs"

/**
 * 未ログインで「ログインして登録する」を押したプランを、ログインが済むまで覚えておく
 * （以前はログイン後にもう一度プランを選び直す必要があり、そこで離れてしまっていた）
 */
export type PendingCheckout = {
  passType: "LITE" | "STANDARD" | "PREMIUM"
  interval: BillingInterval
}

const STORAGE_KEY = "aipictors-plus-pending-checkout"

// ログインにかかる時間だけ覚える。あとで別の用事でログインしたときに決済へ進まないようにする
const EXPIRES_MS = 15 * 60 * 1000

export function savePendingCheckout(pending: PendingCheckout) {
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...pending, at: Date.now() }),
    )
  } catch (_error) {
    // 保存できなければ、ログイン後に選び直してもらう
  }
}

export function clearPendingCheckout() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch (_error) {
    // 何もしない
  }
}

/**
 * 覚えておいたプランを取り出す（取り出したら消す。期限切れ・壊れた値は null）
 */
export function takePendingCheckout(now = Date.now()): PendingCheckout | null {
  let raw: string | null = null
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY)
  } catch (_error) {
    return null
  }
  if (raw === null) return null
  clearPendingCheckout()
  return parsePendingCheckout(raw, now)
}

export function parsePendingCheckout(
  raw: string,
  now: number,
): PendingCheckout | null {
  try {
    const value: unknown = JSON.parse(raw)
    if (typeof value !== "object" || value === null) return null
    const { passType, interval, at } = value as Record<string, unknown>
    if (passType !== "LITE" && passType !== "STANDARD" && passType !== "PREMIUM") {
      return null
    }
    if (interval !== "month" && interval !== "year") return null
    if (typeof at !== "number" || now - at > EXPIRES_MS || at > now) return null
    return { passType, interval }
  } catch (_error) {
    return null
  }
}
