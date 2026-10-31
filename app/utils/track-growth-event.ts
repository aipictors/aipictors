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
