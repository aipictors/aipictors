import { config } from "~/config"
import { normalizeGenerativeFileUrl } from "~/utils/normalize-generative-file-url"

function isSameOriginUrl(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.href)
    return resolved.origin === window.location.origin
  } catch {
    return false
  }
}

function toCorsDownloadWorkerUrl(targetUrl: string): string {
  const workerBase = config.downloader.corsDownload
  const downloadUrl = new URL("/download", workerBase)
  downloadUrl.searchParams.set("url", targetUrl)
  return downloadUrl.toString()
}

export function getDownloadProxyUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl

  const normalizedUrl = normalizeGenerativeFileUrl(originalUrl)

  if (normalizedUrl.startsWith("blob:") || normalizedUrl.startsWith("data:")) {
    return normalizedUrl
  }

  // already proxied
  if (normalizedUrl.startsWith(config.downloader.corsDownload)) {
    return normalizedUrl
  }

  if (normalizedUrl.startsWith("/api/download-image")) {
    return normalizedUrl
  }

  if (isSameOriginUrl(normalizedUrl)) {
    return normalizedUrl
  }

  // Prefer the dedicated Worker proxy for cross-origin URLs.
  try {
    const absolute = new URL(normalizedUrl, window.location.href).toString()
    return toCorsDownloadWorkerUrl(absolute)
  } catch {
    // Fallback to the legacy same-origin proxy.
    return `/api/download-image?url=${encodeURIComponent(normalizedUrl)}`
  }
}
