import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

const ALLOWED_HOSTS = new Set(["assets.aipictors.com"])

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)
  const target = requestUrl.searchParams.get("url")
  if (!target) {
    return new Response("Missing url", { status: 400 })
  }

  let targetUrl: URL
  try {
    targetUrl = new URL(target)
  } catch {
    return new Response("Invalid url", { status: 400 })
  }

  if (targetUrl.protocol !== "https:") {
    return new Response("Only https is allowed", { status: 400 })
  }

  if (!ALLOWED_HOSTS.has(targetUrl.hostname)) {
    return new Response("Forbidden host", { status: 403 })
  }

  const upstream = await fetch(targetUrl.toString())
  if (!upstream.ok) {
    return new Response("Upstream error", { status: upstream.status })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get("content-type")
  if (contentType) headers.set("content-type", contentType)

  // static assets
  headers.set("cache-control", "public, max-age=86400, s-maxage=86400")
  headers.set("access-control-allow-origin", "*")

  return new Response(upstream.body, {
    status: 200,
    headers,
  })
}
