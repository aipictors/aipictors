/**
 * 画像URLから指定拡張子のBase64文字列を取得する
 * @param url 画像URL
 * @param format 変換する拡張子 (例: 'image/jpeg', 'image/png', 'image/webp')
 */
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { fetchPublic } from "~/utils/fetch-public"

const base64PromiseCache = new Map<string, Promise<string>>()

function getOrSetCached(
  key: string,
  factory: () => Promise<string>,
): Promise<string> {
  const cached = base64PromiseCache.get(key)
  if (cached) {
    return cached
  }

  if (base64PromiseCache.size > 256) {
    base64PromiseCache.clear()
  }

  const promise = factory().catch((error) => {
    base64PromiseCache.delete(key)
    throw error
  })
  base64PromiseCache.set(key, promise)
  return promise
}

export async function getBase64FromImageUrl(
  url: string,
  format?: "image/jpeg" | "image/webp" | "image/png",
): Promise<string> {
  const fetchUrl = getDownloadProxyUrl(url)
  const cacheKey = `${format ?? "default"}|${fetchUrl}`

  try {
    return await getOrSetCached(cacheKey, async () => {
      const response = await fetchPublic(fetchUrl, {
        headers: {
          Accept: "image/*,*/*;q=0.8",
        },
      })
      const blob = await response.blob()

      // BlobからImageを生成
      const image = await createImageBitmap(blob)

      // 変換後の画像を描画するためのキャンバスを作成
      const canvas = document.createElement("canvas")
      canvas.width = image.width
      canvas.height = image.height

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(image, 0, 0)
      }

      // 指定されたフォーマットでBase64文字列を取得
      if (format) {
        return canvas.toDataURL(format, 1.0)
      }
      return canvas.toDataURL()
    })
  } catch (error) {
    console.error("エラーが発生しました:", error)
    throw error
  }
}
