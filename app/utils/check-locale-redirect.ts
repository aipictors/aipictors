import { parse } from "cookie"
import {
  buildLocalePath,
  getPathLocale,
  normalizeLocalePath,
  type SupportedLocale,
} from "~/utils/locale-path"

export type LocaleRedirect = {
  status: number
  headers: {
    Location: string
  }
}

export function checkLocaleRedirect(request: Request): LocaleRedirect | null {
  const cookieHeader = request.headers.get("Cookie")
  const cookies = cookieHeader ? parse(cookieHeader) : {}
  const cookieLocale =
    cookies.locale === "en" || cookies.locale === "ja"
      ? cookies.locale
      : null

  // ユーザーが言語切替で保存した cookie を最優先にし、未設定時のみブラウザ言語を使う
  const acceptLanguage = request.headers.get("Accept-Language")?.toLowerCase()

  const locale: SupportedLocale = cookieLocale
    ? cookieLocale
    : acceptLanguage
    ? acceptLanguage.startsWith("en")
      ? "en"
      : "ja"
    : "ja"

  const url = new URL(request.url)
  const pathname = url.pathname
  const normalizedPathname = normalizeLocalePath(pathname)

  if (pathname !== normalizedPathname) {
    return {
      status: 302,
      headers: {
        Location: `${normalizedPathname}${url.search}`,
      },
    }
  }

  // 明示的な英語優先時のみ /en を強制する。手動で開いている日本語URLはそのまま許可する。
  if (locale === "en" && getPathLocale(pathname) !== "en") {
    return {
      status: 302,
      headers: {
        Location: `${buildLocalePath("en", pathname)}${url.search}`,
      },
    }
  }

  return null // リダイレクト不要の場合は null を返す
}
