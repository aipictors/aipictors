import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { fetchPublic } from "~/utils/fetch-public"

type Options = {
  skipGenerativeNormalization?: boolean
  /**
   * 画像を PNG に変換してダウンロードする。
   * 変換には fetch + Canvas を使うため、環境やCORSによって失敗する場合は通常ダウンロードへフォールバックする。
   */
  convertToPng?: boolean
  /**
   * 互換用（旧オプション名）。convertToPng と同義。
   */
  convertJpegToPng?: boolean
}

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_")
}

function createDownloadLink(url: string, filename?: string) {
  const linkNode = document.createElement("a")
  linkNode.href = url
  // filename を渡さない場合は、レスポンス側(Content-Disposition)に任せる
  linkNode.download = filename ?? ""
  linkNode.rel = "noopener"
  return linkNode
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("画像の変換に失敗しました。"))
        return
      }
      resolve(blob)
    }, type)
  })
}

async function convertJpegBlobToPngBlob(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)

  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas の初期化に失敗しました。")
    ctx.drawImage(bitmap, 0, 0)
    return canvas.convertToBlob({ type: "image/png" })
  }

  const canvas = document.createElement("canvas")
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas の初期化に失敗しました。")
  ctx.drawImage(bitmap, 0, 0)
  return canvasToBlob(canvas, "image/png")
}

async function convertImageBlobToPngBlob(blob: Blob): Promise<Blob> {
  // Prefer createImageBitmap for performance; fallback to <img> if needed.
  try {
    const bitmap = await createImageBitmap(blob)

    if (typeof OffscreenCanvas !== "undefined") {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas の初期化に失敗しました。")
      ctx.drawImage(bitmap, 0, 0)
      return canvas.convertToBlob({ type: "image/png" })
    }

    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Canvas の初期化に失敗しました。")
    ctx.drawImage(bitmap, 0, 0)
    return canvasToBlob(canvas, "image/png")
  } catch {
    // Fallback path (Safari edge cases etc.)
    const objectUrl = URL.createObjectURL(blob)
    try {
      const img = document.createElement("img")
      img.decoding = "async"
      img.src = objectUrl
      await img.decode()

      if (typeof OffscreenCanvas !== "undefined") {
        const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight)
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas の初期化に失敗しました。")
        ctx.drawImage(img, 0, 0)
        return canvas.convertToBlob({ type: "image/png" })
      }

      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas の初期化に失敗しました。")
      ctx.drawImage(img, 0, 0)
      return canvasToBlob(canvas, "image/png")
    } finally {
      URL.revokeObjectURL(objectUrl)
    }
  }
}

export const downloadImageFile = async (
  _fileName: string,
  imageUrl: string,
  options?: Options,
): Promise<void> => {
  if (!imageUrl) {
    console.error("画像が存在しません")
    return
  }

  try {
    const downloadUrl = getDownloadProxyUrl(imageUrl, options)

    const shouldConvertToPng =
      options?.convertToPng === true || options?.convertJpegToPng === true

    if (shouldConvertToPng) {
      const safeBaseName = sanitizeFileName(_fileName || "file")

      // Prefer HEAD to avoid buffering already-PNG files.
      try {
        const headResponse = await fetchPublic(downloadUrl, { method: "HEAD" })
        const contentType = (headResponse.headers.get("content-type") ?? "")
          .toLowerCase()
          .trim()

        if (contentType.startsWith("image/png")) {
          const linkNode = createDownloadLink(
            downloadUrl,
            `${safeBaseName}.png`,
          )
          document.body.appendChild(linkNode)
          linkNode.click()
          document.body.removeChild(linkNode)
          return
        }
      } catch {
        // If HEAD fails, continue with GET-based detection.
      }

      const response = await fetchPublic(downloadUrl)
      const blob = await response.blob()

      const mime = (blob.type || "").toLowerCase().trim()

      // Already PNG: just download with .png filename
      if (mime.startsWith("image/png")) {
        const objectUrl = URL.createObjectURL(blob)
        const linkNode = createDownloadLink(objectUrl, `${safeBaseName}.png`)
        document.body.appendChild(linkNode)
        linkNode.click()
        document.body.removeChild(linkNode)
        URL.revokeObjectURL(objectUrl)
        return
      }

      // Convert common raster images (jpeg/webp/others) into PNG
      if (mime.startsWith("image/")) {
        const pngBlob = mime.startsWith("image/jpeg")
          ? await convertJpegBlobToPngBlob(blob)
          : await convertImageBlobToPngBlob(blob)

        const objectUrl = URL.createObjectURL(pngBlob)
        const linkNode = createDownloadLink(objectUrl, `${safeBaseName}.png`)
        document.body.appendChild(linkNode)
        linkNode.click()
        document.body.removeChild(linkNode)
        URL.revokeObjectURL(objectUrl)
        return
      }

      // Unexpected content: fallback to default download (Content-Disposition)
      const linkNode = createDownloadLink(downloadUrl)
      document.body.appendChild(linkNode)
      linkNode.click()
      document.body.removeChild(linkNode)
      return
    }

    // Let the proxy set Content-Disposition (timestamp naming). Using an <a> click keeps it
    // closer to a user gesture and avoids buffering large blobs in memory.
    const linkNode = createDownloadLink(downloadUrl)

    document.body.appendChild(linkNode)
    linkNode.click()
    document.body.removeChild(linkNode)
  } catch (error) {
    console.error(error)
    // 必要に応じてUI上のエラーメッセージ表示
  }
}
