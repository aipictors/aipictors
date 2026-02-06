import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare"
import { RemixServer } from "@remix-run/react"
import { isbot } from "isbot"
import { renderToReadableStream } from "react-dom/server"

declare global {
  interface CacheStorage {
    default: Cache
  }
}

const isHtmlDocumentRequest = (request: Request, url: URL): boolean => {
  if (request.method !== "GET") return false
  // Remix のデータリクエストはHTMLではないのでキャッシュ対象外
  if (url.searchParams.has("_data")) return false
  const accept = request.headers.get("accept") ?? ""
  return accept.includes("text/html")
}

const hasUserSpecificHeaders = (request: Request): boolean => {
  // Cookie / Authorization がある場合はユーザー依存になり得る
  const cookie = request.headers.get("cookie")
  if (cookie && cookie.trim().length > 0) return true
  if (request.headers.get("authorization")) return true
  return false
}

const parseCacheControlMaxAgeSeconds = (
  cacheControl: string,
): number | null => {
  const lower = cacheControl.toLowerCase()
  if (
    lower.includes("no-store") ||
    lower.includes("no-cache") ||
    lower.includes("private")
  ) {
    return null
  }

  // s-maxage を優先
  const sMaxAgeMatch = lower.match(/s-maxage\s*=\s*(\d+)/)
  if (sMaxAgeMatch?.[1]) {
    const seconds = Number(sMaxAgeMatch[1])
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null
  }

  const maxAgeMatch = lower.match(/max-age\s*=\s*(\d+)/)
  if (maxAgeMatch?.[1]) {
    const seconds = Number(maxAgeMatch[1])
    return Number.isFinite(seconds) && seconds > 0 ? seconds : null
  }

  return null
}

export default async function handleRequest(
  request: Request,
  loaderStatusCode: number,
  headers: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const url = new URL(request.url)

  const cacheKey = new Request(
    url.toString(),
    new Request(request.url, request),
  )

  const cacheControl = headers.get("Cache-Control")
  const cacheTtlSeconds = cacheControl
    ? parseCacheControlMaxAgeSeconds(cacheControl)
    : null
  const canUseEdgeHtmlCache =
    import.meta.env.PROD &&
    loaderStatusCode === 200 &&
    cacheTtlSeconds !== null &&
    isHtmlDocumentRequest(request, url) &&
    !hasUserSpecificHeaders(request) &&
    !headers.has("Set-Cookie")

  if (canUseEdgeHtmlCache) {
    const cachedResponse = await caches.default.match(cacheKey)
    if (cachedResponse) {
      const storedAtRaw = cachedResponse.headers.get("X-Edge-Cache-Stored-At")
      const storedAt = storedAtRaw ? Number(storedAtRaw) : Number.NaN
      if (Number.isFinite(storedAt)) {
        const ageMs = Date.now() - storedAt
        if (ageMs >= 0 && ageMs < cacheTtlSeconds * 1000) {
          return cachedResponse
        }
      }
    }
  }

  let remixStatusCode = loaderStatusCode

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      onError(error: unknown) {
        console.error(error)
        remixStatusCode = 500
      },
    },
  )

  if (isbot(request.headers.get("user-agent"))) {
    await body.allReady
  }

  headers.set("Content-Type", "text/html")

  // エラー系レスポンスはキャッシュさせない（負のキャッシュ抑止）
  if (remixStatusCode >= 400) {
    headers.set("Cache-Control", "no-store")
  }

  const response = new Response(body, {
    headers: headers,
    status: remixStatusCode,
  })

  if (canUseEdgeHtmlCache) {
    const responseForCache = response.clone()
    responseForCache.headers.set("X-Edge-Cache-Stored-At", String(Date.now()))
    loadContext.cloudflare.ctx.waitUntil(
      caches.default.put(cacheKey, responseForCache),
    )
  }

  return response
}
