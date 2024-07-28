import { config } from "~/config"
import { object, string, safeParse, nullable } from "valibot"

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
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": type,
      },
      body: blob,
    })

    if (response.ok) {
      const responseData = await response.json()

      // Valibotでレスポンスデータのバリデーションを実行
      const schema = object({
        data: object({
          fileId: string(),
          url: string(),
        }),
        error: nullable(string()),
      })

      const validationResult = safeParse(schema, responseData)
      if (!validationResult.success) {
        throw new Error("画像のアップロードに失敗いたしました")
      }

      return validationResult.output.data.url
    }
  } catch (error) {
    console.error(error)
  }
  throw new Error("画像のアップロードに失敗いたしました")
}
