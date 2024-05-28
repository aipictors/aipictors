import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare"
import { RemixServer } from "@remix-run/react"
import { renderToReadableStream } from "react-dom/server"

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const url = new URL(request.url)
  const cacheKey = new Request(url.toString(), request)
  const cache = caches.default
  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    // cachedResponseはimmutableなので、headerを変更するために新しいResponseを作成する
    return new Response(cachedResponse.body, {
      // キャッシュからのレスポンスかを確認するためのヘッダー（無くても良い）
      headers: { ...cachedResponse.headers, "Custom-Cached-Response": "true" },
      status: cachedResponse.status,
    })
  }

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        // Log streaming rendering errors from inside the shell
        console.error(error)
        responseStatusCode
      },
    },
  )

  responseHeaders.set("Content-Type", "text/html")
  if (url.pathname === "/") {
    responseHeaders.set("Cache-Control", "public, maxage=1800")
  } else {
    responseHeaders.set("Cache-Control", "public, maxage=86400")
  }
  // キャッシュからのレスポンスかを確認するためのヘッダー（無くても良い）
  responseHeaders.set("Custom-Cached-Response", "false")
  const response = new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  })

  // remix.env.d.tsで渡したEventContextを取り出して使う
  loadContext.ctx.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}
