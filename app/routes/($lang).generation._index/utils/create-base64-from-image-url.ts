import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { getOrSetCachedDataUrl } from "~/utils/base64-image-cache"
import { fetchPublic } from "~/utils/fetch-public"

/** 待ってからやり直す値打ちがあるか（4xx は何度送っても同じ） */
export function isRetryableImageFetch(result: {
  status?: number
  error?: unknown
}): boolean {
  if (result.error !== undefined) {
    // 通信の切断・タイムアウトは TypeError / AbortError になる
    return true
  }
  if (result.status === undefined) {
    return false
  }
  return result.status === 408 || result.status === 429 || result.status >= 500
}

const RETRY_WAIT_MS = 600

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
  return await getOrSetCachedDataUrl(fetchUrl, async () => {
    // モバイル通信では 1 回の失敗で投稿画面に画像が入らなくなるので、一度だけ待ってやり直す
    for (let attempt = 0; ; attempt++) {
      const isLastAttempt = attempt >= 1

      let response: Response
      try {
        response = await fetchPublic(fetchUrl, {
          headers: {
            Accept: "image/*,*/*;q=0.8",
          },
        })
      } catch (error) {
        if (isLastAttempt || !isRetryableImageFetch({ error })) {
          throw error
        }
        await wait(RETRY_WAIT_MS)
        continue
      }

      if (!response.ok) {
        if (
          isLastAttempt ||
          !isRetryableImageFetch({ status: response.status })
        ) {
          throw new Error(`Failed to load image (${response.status})`)
        }
        await wait(RETRY_WAIT_MS)
        continue
      }

      const blob = await response.blob()
      return await blobToDataUrl(blob)
    }
  })
}
