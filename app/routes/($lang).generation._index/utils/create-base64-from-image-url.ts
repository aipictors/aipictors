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

  // メモリ肥大化を避けるため、上限を超えたら全クリア（投稿画面の一時利用が主）
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
 * 画像URLからBase64を生成する。
 *
 * - 生成画像URLはCORS設定によってCanvas経由の変換が失敗することがあるため、
 *   同一オリジン/プロキシ経由でfetchしてData URLへ変換する。
 */
export async function createBase64FromImageURL(
  imageURL: string,
): Promise<string> {
  if (!imageURL) {
    throw new Error("Missing image url")
  }

  const fetchUrl = getDownloadProxyUrl(imageURL)
  return await getOrSetCached(fetchUrl, async () => {
    const response = await fetchPublic(fetchUrl, {
      headers: {
        Accept: "image/*,*/*;q=0.8",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to load image (${response.status})`)
    }

    const blob = await response.blob()
    return await blobToDataUrl(blob)
  })
}
