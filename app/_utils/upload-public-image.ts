import { config } from "@/config"
import { z } from "zod"

// レスポンススキーマの定義
const responseSchema = z.object({
  url: z.string().url(),
})

/**
 * 画像アップロード
 * @param image base64形式の画像
 * @param token 認証トークン
 * @returns アップロードした画像URL
 */
export const uploadPublicImage = async (
  image: string,
  token: string | undefined | null,
): Promise<string> => {
  if (token === null || token === undefined) throw new Error("Token is not set")

  try {
    const base64data = image.split(",")[1]
    const type = (() => {
      if (image.includes("jpeg")) return "image/jpeg"
      if (image.includes("webp")) return "image/webp"
      return "image/png"
    })()

    const blob = new Blob(
      [Uint8Array.from(atob(base64data), (c) => c.charCodeAt(0))],
      { type },
    )

    const endpoint = config.uploader.uploadImage

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": type,
      },
      body: blob,
    })

    if (response.ok) {
      const responseData = await response.json()

      // Zodでレスポンスデータのバリデーションを実行
      const parsedData = responseSchema.parse(responseData)
      return parsedData.url
    }
    throw new Error("Failed to upload image")
  } catch (error) {
    console.error("Failed to upload image", error)
  }

  throw new Error("Failed to upload image after multiple attempts")
}
