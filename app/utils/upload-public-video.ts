import { config } from "~/config"
import { object, string, safeParse, nullable } from "valibot"

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
): Promise<string> => {
  try {
    const endpoint = config.uploader.uploadImage

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "video/mp4",
      },
      body: file,
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
        throw new Error("動画のアップロードに失敗いたしました")
      }

      return validationResult.output.data.url
    }
  } catch (error) {
    console.error(error)
  }
  throw new Error("動画のアップロードに失敗いたしました")
}
