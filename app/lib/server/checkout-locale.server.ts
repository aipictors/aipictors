import { getPathLocale } from "~/utils/locale-path"

/**
 * Stripe の画面（決済・カード変更）に渡す表示言語
 * 画面が body の locale で明示していればそれを、なければ呼び出し元のページ（Referer）が /en かどうかで決める。
 * どちらも分からなければ null（Stripe に任せる = 今までどおり）
 */
export const getCheckoutLocale = (
  request: { url: string; headers: { get(name: string): string | null } },
  bodyLocale?: unknown,
): "en" | "ja" | null => {
  if (bodyLocale === "en" || bodyLocale === "ja") return bodyLocale
  const referer = request.headers.get("referer")
  if (!referer) return null
  try {
    const url = new URL(referer)
    if (url.host !== new URL(request.url).host) return null
    return getPathLocale(url.pathname)
  } catch {
    return null
  }
}
