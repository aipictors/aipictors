/**
 * Cloudflare Stream の URL/UID ヘルパー
 */

const STREAM_IFRAME_HOST = "iframe.videodelivery.net"
const STREAM_DELIVERY_HOST = "videodelivery.net"
const STREAM_HOST_SUFFIX = ".cloudflarestream.com"

export function isCloudflareStreamUid(value: string | null | undefined): boolean {
  if (!value) {
    return false
  }

  return /^[0-9a-f]{32}$/i.test(value.trim())
}

function getPathFirstSegment(pathname: string): string | null {
  const [first] = pathname.split("/").filter(Boolean)
  return first ?? null
}

/**
 * Cloudflare Stream の動画UIDを抽出する
 */
export function getCloudflareStreamUid(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()

    if (
      host === STREAM_IFRAME_HOST ||
      host === STREAM_DELIVERY_HOST ||
      host.endsWith(STREAM_HOST_SUFFIX)
    ) {
      return getPathFirstSegment(parsed.pathname)
    }

    return null
  } catch {
    return null
  }
}

/**
 * Cloudflare Stream URL かどうか判定する
 */
export function isCloudflareStreamUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false
  }

  return getCloudflareStreamUid(url) !== null
}

/**
 * Cloudflare Stream の埋め込みURLへ正規化する
 */
export function toCloudflareStreamEmbedUrl(
  url: string | null | undefined,
): string | null {
  if (!url) {
    return null
  }

  const uid = getCloudflareStreamUid(url)
  if (!uid) {
    return null
  }

  return `https://${STREAM_IFRAME_HOST}/${uid}`
}

export function toCloudflareStreamEmbedUrlFromUid(
  uid: string | null | undefined,
): string | null {
  if (!isCloudflareStreamUid(uid)) {
    return null
  }

  return `https://${STREAM_IFRAME_HOST}/${uid}`
}

export function toCloudflareStreamHlsUrlFromUid(
  uid: string | null | undefined,
): string | null {
  if (!isCloudflareStreamUid(uid)) {
    return null
  }

  return `https://${STREAM_DELIVERY_HOST}/${uid}/manifest/video.m3u8`
}
