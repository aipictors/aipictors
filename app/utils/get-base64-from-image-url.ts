/**
 * 画像URLから指定拡張子のBase64文字列を取得する
 * @param url 画像URL
 * @param format 変換する拡張子 (例: 'image/jpeg', 'image/png', 'image/webp')
 */
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"
import { fetchPublic } from "~/utils/fetch-public"

export async function getBase64FromImageUrl(
  url: string,
  format?: "image/jpeg" | "image/webp" | "image/png",
): Promise<string> {
  try {
    const fetchUrl = getDownloadProxyUrl(url)
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
      return await canvas.toDataURL(format, 1.0)
    }
    return await canvas.toDataURL()
  } catch (error) {
    console.error("エラーが発生しました:", error)
    throw error
  }
}
