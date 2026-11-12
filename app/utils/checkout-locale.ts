import { getPathLocale } from "~/utils/locale-path"

/**
 * 決済画面（Stripe）から戻る URL は日本語のページ（/plus/success など）に決まっているので、
 * 英語のページから決済へ進んだことを覚えておき、戻ってきたら英語のページへ移す
 */
const STORAGE_KEY = "aipictors-checkout-locale"

export function rememberCheckoutLocale() {
  try {
    if (getPathLocale(window.location.pathname) === "en") {
      window.sessionStorage.setItem(STORAGE_KEY, "en")
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch (_error) {
    // 覚えておけなければ、日本語のページに戻るだけ
  }
}

/**
 * 英語のページから決済へ進んでいて、今が日本語の URL なら、移る先の英語の URL を返す（1 回だけ）
 */
export function takeEnglishReturnPath(): string | null {
  try {
    if (window.sessionStorage.getItem(STORAGE_KEY) !== "en") return null
    window.sessionStorage.removeItem(STORAGE_KEY)
  } catch (_error) {
    return null
  }
  const { pathname, search } = window.location
  if (getPathLocale(pathname) === "en") return null
  return `/en${pathname}${search}`
}

/**
 * Stripe の画面（決済・カード変更）を出す言語。今のページが英語（/en）なら "en"
 * /api/stripe/* の body に locale として渡す（渡さなくても、サーバーが呼び出し元のページから判断する）
 */
export function getCheckoutLocale(): "ja" | "en" {
  return getPathLocale(window.location.pathname)
}
