/**
 * files.aipictors.com の画像を、表示サイズに縮小した版の URL にする。
 * 縮小は files.aipictors.com/_w/<幅>/<キー> の Worker（aipictors-cron の image-resize-worker）が行い、
 * 縮小版は R2 とエッジにキャッシュされる。アニメーション画像などは Worker が元の画像をそのまま返す。
 */

const RESIZABLE_ORIGIN = "https://files.aipictors.com/"

/** Worker が受け付ける幅（Worker 側の WIDTHS と同じにする） */
export const RESIZED_IMAGE_WIDTHS = [
  48, 64, 96, 128, 160, 240, 320, 400, 480, 640,
] as const

function isResizable(url: string | null | undefined): url is string {
  if (!url?.startsWith(RESIZABLE_ORIGIN)) return false
  const key = url.slice(RESIZABLE_ORIGIN.length)
  return key.length > 0 && !key.startsWith("_w/") && !key.includes("?")
}

function pickWidth(width: number) {
  return (
    RESIZED_IMAGE_WIDTHS.find((w) => w >= width) ??
    RESIZED_IMAGE_WIDTHS[RESIZED_IMAGE_WIDTHS.length - 1]
  )
}

/**
 * 幅 width（以上で一番近い対応幅）に縮小した画像の URL。縮小できない URL はそのまま返す
 */
export function toResizedImageUrl(
  url: string | null | undefined,
  width: number,
): string | undefined {
  if (!url) return undefined
  if (!isResizable(url)) return url
  const key = url.slice(RESIZABLE_ORIGIN.length)
  return `${RESIZABLE_ORIGIN}_w/${pickWidth(width)}/${key}`
}

/**
 * srcset 用の文字列。maxWidth（元画像の幅）を超える幅は作らない。
 * 一番大きい候補も元画像ではなく再圧縮版にする（元画像は画質が高く重い）
 */
export function toResizedImageSrcSet(
  url: string | null | undefined,
  options: { minWidth?: number; maxWidth?: number } = {},
): string | undefined {
  if (!isResizable(url)) return undefined
  const minWidth = options.minWidth ?? 0
  const maxWidth = options.maxWidth ?? Number.POSITIVE_INFINITY
  const widths = RESIZED_IMAGE_WIDTHS.filter(
    (w) => w >= minWidth && w < maxWidth,
  )
  const entries = widths.map((w) => `${toResizedImageUrl(url, w)} ${w}w`)
  if (Number.isFinite(maxWidth)) {
    entries.push(`${toResizedImageUrl(url, maxWidth)} ${Math.round(maxWidth)}w`)
  }
  return entries.length > 0 ? entries.join(", ") : undefined
}
