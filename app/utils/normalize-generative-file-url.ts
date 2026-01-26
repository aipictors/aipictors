const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const canonicalHost = "generative-files.aipictors.com"

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

  if (url.startsWith("blob:") || url.startsWith("data:")) {
    return url
  }

  let parsed: URL
  try {
    parsed = new URL(url, getBaseUrlForParsing())
  } catch {
    return url
  }

  const hostname = parsed.hostname
  if (
    hostname !== "generative.files.aipictors.com" &&
    hostname !== canonicalHost
  ) {
    return url
  }

  const pathSegments = parsed.pathname.split("/").filter(Boolean)
  const maybeId = pathSegments[0]

  if (!maybeId || !uuidRegex.test(maybeId)) {
    return url
  }

  return `https://${canonicalHost}/${maybeId}`
}
