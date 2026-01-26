import type { ActionFunctionArgs } from "@remix-run/cloudflare"
import { zipSync } from "fflate"

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatTimestamp(date: Date) {
  return (
    date.getFullYear() +
    pad2(date.getMonth() + 1) +
    pad2(date.getDate()) +
    pad2(date.getHours()) +
    pad2(date.getMinutes()) +
    pad2(date.getSeconds())
  )
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

function getExtFromContentType(contentType: string): "png" | "jpg" | "webp" {
  const lower = contentType.toLowerCase()
  if (lower.includes("image/webp")) return "webp"
  if (lower.includes("image/jpeg") || lower.includes("image/jpg")) return "jpg"
  return "png"
}

type Payload = {
  urls: string[]
  name?: string
}

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData()
  const raw = form.get("payload")

  if (typeof raw !== "string" || raw.length === 0) {
    return new Response("Missing payload", { status: 400 })
  }

  let payload: Payload
  try {
    payload = JSON.parse(raw) as Payload
  } catch {
    return new Response("Invalid payload", { status: 400 })
  }

  if (!Array.isArray(payload.urls) || payload.urls.length === 0) {
    return new Response("No urls", { status: 400 })
  }

  // Basic limits to avoid abuse.
  if (payload.urls.length > 50) {
    return new Response("Too many urls", { status: 400 })
  }

  const entries: Record<string, Uint8Array> = {}

  for (let index = 0; index < payload.urls.length; index++) {
    const rawUrl = payload.urls[index]
    let url: URL

    try {
      url = new URL(rawUrl)
    } catch {
      return new Response("Invalid url", { status: 400 })
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return new Response("Invalid protocol", { status: 400 })
    }

    if (!isAllowedHost(url.hostname)) {
      return new Response("Host not allowed", { status: 403 })
    }

    const upstream = await fetch(url.toString(), {
      headers: {
        Accept: "image/*,*/*;q=0.8",
        "Accept-Encoding": "identity",
      },
    })

    if (!upstream.ok) {
      return new Response("Failed to fetch upstream", { status: 502 })
    }

    const buffer = await upstream.arrayBuffer()
    const contentType = upstream.headers.get("content-type") ?? ""

    const ext = getExtFromContentType(contentType)
    const base =
      url.pathname.split("/").filter(Boolean).at(-1) ?? `image-${index + 1}`
    const safeBase = base.replace(/[\\/]/g, "_")
    const fileName = safeBase.includes(".") ? safeBase : `${safeBase}.${ext}`

    // Ensure unique names.
    const unique = entries[fileName] ? `${index + 1}_${fileName}` : fileName

    entries[unique] = new Uint8Array(buffer)
  }

  const zipData = zipSync(entries, {})
  // fflate's typings may use ArrayBufferLike; copy into a standard Uint8Array (ArrayBuffer-backed)
  const safeZipData = new Uint8Array(zipData)

  const now = new Date()
  const baseName = (payload.name ?? "images").replace(/[\\/]/g, "_")
  const zipName = `${baseName}_${formatTimestamp(now)}.zip`

  return new Response(safeZipData, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(zipName)}`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  })
}

export default function Route() {
  return null
}
