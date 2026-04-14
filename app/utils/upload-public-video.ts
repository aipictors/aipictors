import { config } from "~/config"
import { object, string, safeParse, nullable, optional } from "valibot"

export type UploadedStreamVideo = {
  uid: string | null
  url: string
}

/**
 * 動画アップロード
 * @param file Blob形式のファイル
 * @param name ファイル名（拡張子含む）
 * @param id ユーザID
 * @returns アップロードした動画URL
 */
export const uploadPublicVideo = async (
  file: Blob,
  token: string | undefined | null,
): Promise<UploadedStreamVideo> => {
  if (token === null || token === undefined) {
    throw new Error(
      "ログイン情報が正しく取得できていません、画面更新もしくはログインしなおしてください",
    )
  }

  try {
    const endpoint = config.uploader.uploadVideo
    const contentType = file.type || "video/mp4"

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": contentType,
      },
      body: file,
    })

    const responseText = await response.text()
    const responseData = responseText ? JSON.parse(responseText) : null

    const schema = object({
      data: object({
        uid: optional(string()),
        url: string(),
      }),
      error: nullable(string()),
    })

    if (response.ok) {
      const validationResult = safeParse(schema, responseData)
      if (!validationResult.success) {
        throw new Error("動画のアップロードに失敗いたしました")
      }

      return {
        uid: validationResult.output.data.uid ?? null,
        url: validationResult.output.data.url,
      }
    }

    const responseError =
      responseData && typeof responseData === "object" && "error" in responseData
        ? responseData.error
        : null

    if (typeof responseError === "string" && responseError.length > 0) {
      throw new Error(responseError)
    }
  } catch (error) {
    console.error(error)

    if (error instanceof Error) {
      throw error
    }
  }
  throw new Error("動画のアップロードに失敗いたしました")
}
