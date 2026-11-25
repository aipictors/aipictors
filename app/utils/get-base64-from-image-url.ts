/**
 * 画像URLから指定拡張子のBase64文字列を取得する
 * @param url 画像URL
 * @param format 変換する拡張子 (例: 'image/jpeg', 'image/png', 'image/webp')
 */
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { getOrSetCachedDataUrl } from "~/utils/base64-image-cache"
import { fetchPublic } from "~/utils/fetch-public"

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result
      if (typeof result === "string") {
        resolve(result)
        return
      }
      reject(new Error("Failed to convert blob to data URL"))
    }
    reader.onerror = () => reject(new Error("Failed to read blob"))
    reader.readAsDataURL(blob)
  })
}

/**
 * 指定の形式に変換する。対応していない形式のときは元の画像をそのまま使う
 */
async function toDataUrlWithFormat(
  blob: Blob,
  format: "image/jpeg" | "image/webp" | "image/png",
): Promise<string> {
  // 画素に展開すると 1 画素 4 バイトになり、スマートフォンでは数枚で落ちる。
  // 展開したものと canvas は使い終わったら必ず捨てる
  const image = await createImageBitmap(blob)
  const canvas = document.createElement("canvas")
  try {
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext("2d")
    if (ctx === null) {
      return await blobToDataUrl(blob)
    }
    ctx.drawImage(image, 0, 0)
    // toDataURL は書き出しが終わるまで画面が止まるので toBlob で書き出す
    const converted = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, 1.0),
    )
    // 対応していない形式だと PNG になる。元の画像より重くなるので使わない
    if (converted === null || converted.type !== format) {
      return await blobToDataUrl(blob)
    }
    return await blobToDataUrl(converted)
  } finally {
    image.close()
    // 画素の領域をすぐ解放する
    canvas.width = 0
    canvas.height = 0
  }
}

export async function getBase64FromImageUrl(
  url: string,
  format?: "image/jpeg" | "image/webp" | "image/png",
): Promise<string> {
  const fetchUrl = getDownloadProxyUrl(url)
  const cacheKey = `${format ?? "default"}|${fetchUrl}`

  try {
    return await getOrSetCachedDataUrl(cacheKey, async () => {
      const response = await fetchPublic(fetchUrl, {
        headers: {
          Accept: "image/*,*/*;q=0.8",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to load image (${response.status})`)
      }

      const blob = await response.blob()

      if (!format) {
        return await blobToDataUrl(blob)
      }

      return await toDataUrlWithFormat(blob, format)
    })
  } catch (error) {
    console.error("エラーが発生しました:", error)
    throw error
  }
}
