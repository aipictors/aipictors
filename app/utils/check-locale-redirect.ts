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

  // クッキーの locale を優先し、なければブラウザの Accept-Language を参照
  const browserLocale =
    request.headers.get("Accept-Language")?.split(",")[0].toLowerCase() || "ja"

  const locale: SupportedLocale =
    cookies.locale === "en" || cookies.locale === "ja"
      ? cookies.locale
      : browserLocale.startsWith("en")
        ? "en"
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
