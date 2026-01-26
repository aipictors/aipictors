import type { LoaderFunctionArgs } from "@remix-run/cloudflare"

function looksLikePng(bytes: Uint8Array) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  )
}

function looksLikeJpeg(bytes: Uint8Array) {
  return (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
}

function looksLikeWebp(bytes: Uint8Array) {
  if (bytes.length < 12) return false
  // RIFF....WEBP
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  )
}

function sniffImageContentType(
  bytes: Uint8Array,
): "image/png" | "image/jpeg" | "image/webp" | null {
  if (looksLikePng(bytes)) return "image/png"
  if (looksLikeJpeg(bytes)) return "image/jpeg"
  if (looksLikeWebp(bytes)) return "image/webp"
  return null
}

function isAllowedHost(hostname: string) {
  const lower = hostname.toLowerCase()

  if (lower === "aipictors.com" || lower.endsWith(".aipictors.com")) {
    return true
  }

  if (lower === "r2.dev" || lower.endsWith(".r2.dev")) {
    return true
  }

  return false
}

export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)
  const rawUrl = requestUrl.searchParams.get("url")
  const fileName = requestUrl.searchParams.get("name")

  if (!rawUrl) {
    return new Response("Missing url", { status: 400 })
  }

  let target: URL
  try {
    target = new URL(rawUrl)
  } catch {
    return new Response("Invalid url", { status: 400 })
  }

  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return new Response("Invalid protocol", { status: 400 })
  }

  if (!isAllowedHost(target.hostname)) {
    return new Response("Host not allowed", { status: 403 })
  }

  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "Accept-Encoding": "identity",
    },
  })

  if (!upstream.ok) {
    return new Response("Failed to fetch upstream", { status: 502 })
  }

  const upstreamBuffer = await upstream.arrayBuffer()
  const bytes = new Uint8Array(upstreamBuffer)
  const sniffed = sniffImageContentType(bytes)

  if (!sniffed) {
    return new Response("Upstream is not an image", { status: 502 })
  }

  const headers = new Headers()
  headers.set("X-Aipictors-Download-Proxy", "1")

  const upstreamContentType = upstream.headers.get("content-type")
  if (upstreamContentType) {
    headers.set("X-Aipictors-Upstream-Content-Type", upstreamContentType)
  }

  headers.set("Content-Type", sniffed)
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("Cache-Control", "no-store")

  const extension =
    sniffed === "image/webp" ? "webp" : sniffed === "image/jpeg" ? "jpg" : "png"

  const derivedBase = (() => {
    const last = target.pathname.split("/").filter(Boolean).at(-1)
    return last ?? "image"
  })()

  const rawName = fileName ?? derivedBase
  const safeBase = rawName.replace(/[\\/]/g, "_")
  const safe = safeBase.includes(".") ? safeBase : `${safeBase}.${extension}`

  headers.set(
    "Content-Disposition",
    `attachment; filename*=UTF-8''${encodeURIComponent(safe)}`,
  )

  return new Response(upstreamBuffer, {
    status: 200,
    headers,
  })
}

export default function Route() {
  return null
}
