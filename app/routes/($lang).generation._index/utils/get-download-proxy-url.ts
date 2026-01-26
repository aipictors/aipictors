import { config } from "~/config"

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

  if (originalUrl.startsWith("blob:") || originalUrl.startsWith("data:")) {
    return originalUrl
  }

  // already proxied
  if (originalUrl.startsWith(config.downloader.corsDownload)) {
    return originalUrl
  }

  if (originalUrl.startsWith("/api/download-image")) {
    return originalUrl
  }

  if (isSameOriginUrl(originalUrl)) {
    return originalUrl
  }

  // Prefer the dedicated Worker proxy for cross-origin URLs.
  try {
    const absolute = new URL(originalUrl, window.location.href).toString()
    return toCorsDownloadWorkerUrl(absolute)
  } catch {
    // Fallback to the legacy same-origin proxy.
    return `/api/download-image?url=${encodeURIComponent(originalUrl)}`
  }
}
