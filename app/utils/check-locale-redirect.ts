import { parse } from "cookie"
import {
  buildLocalePath,
  getPathLocale,
  normalizeLocalePath,
  toLocaleFromAcceptLanguage,
  type SupportedLocale,
} from "~/utils/locale-path"

type LocaleRedirect = {
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
  const locale: SupportedLocale =
    cookieLocale ??
    toLocaleFromAcceptLanguage(request.headers.get("Accept-Language"))

  const url = new URL(request.url)
  const pathname = url.pathname
  const normalizedPathname = normalizeLocalePath(pathname)

  // /ja/… や末尾のスラッシュは、どの人にも同じ URL へ移すので恒久的な転送にする
  // （一時的な転送だと検索エンジンが元の URL を残し、評価がまとまらない）
  if (pathname !== normalizedPathname) {
    return {
      status: 301,
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

  // 英語の URL も、言語切替で日本語を選んだとき（cookie）だけ日本語へ戻す。
  // ブラウザ言語だけで戻すと、Accept-Language を送らない検索エンジンが英語版を読めず、
  // 計測ツール（PageSpeed Insights）も /home→/en/home→/home と転送されていた
  if (cookieLocale === "ja" && getPathLocale(pathname) === "en") {
    return {
      status: 302,
      headers: {
        Location: `${buildLocalePath("ja", pathname)}${url.search}`,
      },
    }
  }

  return null // リダイレクト不要の場合は null を返す
}
