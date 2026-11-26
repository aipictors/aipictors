import { getApps } from "firebase/app"
import { withFirebaseAnalytics } from "~/utils/run-after-load-idle"

declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void
  }
}

/**
 * GA4 のイベント名にできる形にする（英数字と _ だけ、先頭は英字、40 文字まで）
 */
function toEventName(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9_]/g, "_").slice(0, 40)
  return /^[A-Za-z]/.test(cleaned) ? cleaned : `e_${cleaned}`.slice(0, 40)
}

/**
 * 登録・生成・決済までのどこで離脱しているかを見るためのイベントを GA4 と Microsoft Clarity に送る
 * （GA4 は「探索 → ファネル」、Clarity はイベントで録画やファネルを絞り込む）
 * 失敗しても画面の操作には影響させない
 */
export function trackFunnelEvent(
  name: string,
  params?: Record<string, string | number>,
) {
  if (typeof window === "undefined") return
  if (import.meta.env.NODE_ENV === "development") return
  const eventName = toEventName(name)
  try {
    window.clarity?.("event", eventName)
  } catch (_error) {
    // Clarity が読み込めていなくても続ける
  }
  if (getApps().length === 0) return
  withFirebaseAnalytics(({ getAnalytics, logEvent }) => {
    logEvent(getAnalytics(), eventName, params)
  })
}

/**
 * 同じイベントを、同じキーでブラウザを開いている間に 1 回だけ送る（再読み込みで二重に数えない）
 */
export function trackFunnelEventOnce(
  name: string,
  key: string,
  params?: Record<string, string | number>,
) {
  if (typeof window === "undefined") return
  const storageKey = `funnel-event:${name}:${key}`
  try {
    if (window.sessionStorage.getItem(storageKey) !== null) return
    window.sessionStorage.setItem(storageKey, "1")
  } catch (_error) {
    return
  }
  trackFunnelEvent(name, params)
}
