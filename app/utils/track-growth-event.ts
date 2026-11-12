/**
 * 課金の案内の表示・クリックを数える（/api/growth-event へのアクセスを Cloudflare の集計で数える）
 * 失敗しても画面の操作には影響させない
 */
export function trackGrowthEvent(event: string, source: string) {
  if (typeof window === "undefined") return
  const url = `/api/growth-event?ev=${encodeURIComponent(event)}&src=${encodeURIComponent(source)}`
  fetch(url, { method: "GET", keepalive: true, cache: "no-store" }).catch(
    () => {},
  )
}

/**
 * 同じ案内の表示を、ブラウザを開いている間に 1 回だけ数える
 * （どのページにも出る案内をページごとに数えると、アクセス数がそのまま計測のリクエスト数になるため）
 */
export function trackGrowthEventOnce(event: string, source: string) {
  if (typeof window === "undefined") return
  const key = `growth-event:${event}:${source}`
  try {
    if (window.sessionStorage.getItem(key) !== null) return
    window.sessionStorage.setItem(key, "1")
  } catch (_error) {
    // 保存できないときは数えない（毎回送ってしまうため）
    return
  }
  trackGrowthEvent(event, source)
}
