import { nullable, object, safeParse, string } from "valibot"
import { config } from "~/config"

const IMAGE_UPLOAD_TIMEOUT_MS = 45_000

/** 遅い回線（スマホのモバイル通信の上りなど）でも送り切れるよう、見込む最低の速さ（バイト/秒） */
const MIN_UPLOAD_BYTES_PER_SECOND = 32_000

/**
 * 画像の大きさに合わせた待ち時間。
 * 一律 45 秒だと、モバイル通信で大きな PNG を何枚も送るときに間に合わずタイムアウトしていた
 */
export const toImageUploadTimeoutMs = (bytes: number) =>
  IMAGE_UPLOAD_TIMEOUT_MS +
  Math.ceil((bytes / MIN_UPLOAD_BYTES_PER_SECOND) * 1000)

/** タイムアウト・通信の切断のときに、もう一度だけ送る */
export const isRetryableUploadError = (error: unknown) => {
  const name =
    typeof error === "object" && error !== null && "name" in error
      ? error.name
      : null
  return name === "AbortError" || name === "TypeError"
}

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
    const timeoutMs = toImageUploadTimeoutMs(blob.size)

    const put = async () => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        // 理由を渡すと AbortError ではなくその値で失敗し、タイムアウトと分からなくなる
        controller.abort()
      }, timeoutMs)
      try {
        return await fetch(endpoint, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": type,
          },
          body: blob,
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeoutId)
      }
    }

    const response = await put().catch((error: unknown) => {
      if (isRetryableUploadError(error)) return put()
      throw error
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
  } catch (error) {
    console.error(error)

    if (
      isRetryableUploadError(error) &&
      (error as Error).name === "AbortError"
    ) {
      throw new Error(
        "画像のアップロードがタイムアウトしました。通信環境を確認して再度お試しください",
      )
    }

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
