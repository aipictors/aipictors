const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const canonicalHost = "generative-files.aipictors.com"

function sanitizeQuotedUrl(url: string): string {
  const decodedQuotes = url
    .trim()
    .replace(/&(quot|#34|#x22);/gi, '"')
    .replace(/^['"]+|['"]+$/g, "")

  return decodedQuotes.replace(
    /^(https?:\/\/[^\s"']+)["'](\/.*)$/i,
    "$1$2",
  )
}

function getBaseUrlForParsing() {
  if (typeof window !== "undefined") {
    return window.location.href
  }
  return "https://www.aipictors.com"
}

/**
 * 画像生成の生成物URLを正規化する。
 *
 * 例:
 * - https://generative.files.aipictors.com/<uuid>/thumbnail?token=... → https://generative-files.aipictors.com/<uuid>
 */
export function normalizeGenerativeFileUrl(url: string): string {
  if (!url) return url

  const sanitizedUrl = sanitizeQuotedUrl(url)

  if (sanitizedUrl.startsWith("blob:") || sanitizedUrl.startsWith("data:")) {
    return sanitizedUrl
  }

  let parsed: URL
  try {
    parsed = new URL(sanitizedUrl, getBaseUrlForParsing())
  } catch {
    return sanitizedUrl
  }

  const hostname = parsed.hostname
  if (
    hostname !== "generative.files.aipictors.com" &&
    hostname !== canonicalHost
  ) {
    return sanitizedUrl
  }

  const pathSegments = parsed.pathname.split("/").filter(Boolean)
  const maybeId = pathSegments[0]

  if (!maybeId || !uuidRegex.test(maybeId)) {
    return sanitizedUrl
  }

  return `https://${canonicalHost}/${maybeId}`
}
