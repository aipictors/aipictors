import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { fetchPublic } from "~/utils/fetch-public"

type Options = {
  skipGenerativeNormalization?: boolean
  /**
   * JPEG の場合のみ PNG に変換してダウンロードする。
   * 変換には fetch + Canvas を使うため、環境やCORSによって失敗する場合は通常ダウンロードへフォールバックする。
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

function extensionFromMimeType(mimeType: string): string {
  if (mimeType === "image/png") return "png"
  if (mimeType === "image/webp") return "webp"
  if (mimeType === "image/jpeg") return "jpg"
  return "bin"
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

    if (options?.convertJpegToPng) {
      const safeBaseName = sanitizeFileName(_fileName || "file")

      // Prefer HEAD to avoid buffering non-JPEG files.
      try {
        const headResponse = await fetchPublic(downloadUrl, { method: "HEAD" })
        const contentType = headResponse.headers.get("content-type") ?? ""
        if (!contentType.toLowerCase().startsWith("image/jpeg")) {
          const linkNode = createDownloadLink(downloadUrl)
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

      if ((blob.type || "").toLowerCase().startsWith("image/jpeg")) {
        const pngBlob = await convertJpegBlobToPngBlob(blob)
        const objectUrl = URL.createObjectURL(pngBlob)
        const linkNode = createDownloadLink(objectUrl, `${safeBaseName}.png`)
        document.body.appendChild(linkNode)
        linkNode.click()
        document.body.removeChild(linkNode)
        URL.revokeObjectURL(objectUrl)
        return
      }

      // Non-JPEG: download as-is (fallback path when HEAD was unavailable)
      const ext = extensionFromMimeType(blob.type)
      const objectUrl = URL.createObjectURL(blob)
      const linkNode = createDownloadLink(objectUrl, `${safeBaseName}.${ext}`)
      document.body.appendChild(linkNode)
      linkNode.click()
      document.body.removeChild(linkNode)
      URL.revokeObjectURL(objectUrl)
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
