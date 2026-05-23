import { nullable, object, safeParse, string } from "valibot"
import { config } from "~/config"

const IMAGE_UPLOAD_TIMEOUT_MS = 45_000

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
  if (token === null || token === undefined)
    throw new Error(
      "ログイン情報が正しく取得できていません、画面更新もしくはログインしなおしてください",
    )

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
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort("image-upload-timeout")
    }, IMAGE_UPLOAD_TIMEOUT_MS)

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": type,
        },
        body: blob,
        signal: controller.signal,
      })

      const responseText = await response.text()
      const responseData =
        responseText.length > 0 ? JSON.parse(responseText) : null

      if (response.ok) {
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

      const responseError =
        responseData &&
        typeof responseData === "object" &&
        "error" in responseData
          ? responseData.error
          : null

      if (typeof responseError === "string" && responseError.length > 0) {
        throw new Error(responseError)
      }

      throw new Error("画像のアップロードに失敗いたしました")
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    console.error(error)

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(
          "画像のアップロードがタイムアウトしました。通信環境を確認して再度お試しください",
        )
      }

      throw error
    }
  }
  throw new Error("画像のアップロードに失敗いたしました")
}
