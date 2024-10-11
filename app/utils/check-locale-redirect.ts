import { json } from "@remix-run/react"
import { parse } from "cookie"

export function checkLocaleRedirect(request: Request, cacheControl?: string) {
  const cookieHeader = request.headers.get("Cookie")
  const cookies = cookieHeader ? parse(cookieHeader) : {}

  // クッキーの locale を優先し、なければブラウザの Accept-Language を参照
  const browserLocale =
    request.headers.get("Accept-Language")?.split(",")[0].toLowerCase() || "ja"

  const locale =
    cookies.locale || (browserLocale.startsWith("en") ? "en" : "ja")

  const url = new URL(request.url)
  const pathname = url.pathname

  const headers: Record<string, string> = {
    Vary: "Cookie, Accept-Language",
  }

  // cacheControl が指定されている場合、Cache-Control ヘッダーを追加
  if (cacheControl) {
    headers["Cache-Control"] = cacheControl
  }

  // locale が "en" で URL が /en で始まっていない場合にリダイレクト
  if (locale === "en" && !pathname.startsWith("/en")) {
    headers.Location = `/en${pathname}`
    return json(null, {
      status: 302,
      headers,
    })
  }

  // リダイレクト不要の場合は null を返す
  return null
}
