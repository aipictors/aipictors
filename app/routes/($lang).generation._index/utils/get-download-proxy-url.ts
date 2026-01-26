function isSameOriginUrl(url: string): boolean {
  try {
    const resolved = new URL(url, window.location.href)
    return resolved.origin === window.location.origin
  } catch {
    return false
  }
}

export function getDownloadProxyUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl

  if (originalUrl.startsWith("blob:") || originalUrl.startsWith("data:")) {
    return originalUrl
  }

  if (originalUrl.startsWith("/api/download-image")) {
    return originalUrl
  }

  if (isSameOriginUrl(originalUrl)) {
    return originalUrl
  }

  return `/api/download-image?url=${encodeURIComponent(originalUrl)}`
}
