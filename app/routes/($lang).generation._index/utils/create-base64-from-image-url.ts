import { fetchPublic } from "~/utils/fetch-public"
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"

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
export async function createBase64FromImageURL(imageURL: string): Promise<string> {
  if (!imageURL) {
    throw new Error("Missing image url")
  }

  const fetchUrl = getDownloadProxyUrl(imageURL)
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
}
