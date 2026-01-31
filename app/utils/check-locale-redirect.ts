import { parse } from "cookie"

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

  const locale =
    cookies.locale || (browserLocale.startsWith("en") ? "en" : "ja")

  const url = new URL(request.url)
  const pathname = url.pathname

  // locale が "en" で URL が /en で始まっていない場合にリダイレクト
  if (locale === "en" && !pathname.startsWith("/en")) {
    return {
      status: 302,
      headers: {
        Location: `/en${pathname}`,
      },
    }
  }

  return null // リダイレクト不要の場合は null を返す
}
