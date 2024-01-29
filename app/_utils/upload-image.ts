import { Config } from "@/config"
import { captureException } from "@sentry/nextjs"

/**
 * 画像アップロード
 * @param image base64形式の画像
 * @param name ファイル名（拡張子含む）
 * @param token ユーザートークン
 * @returns アップロードした画像URL（ログインユーザ以外からは閲覧できないので注意）
 */
export const uploadImage = async (
  image: string,
  name: string,
  token: string,
): Promise<string> => {
  const blob = new Blob([image], { type: "text/plain" })
  const formData = new FormData()

  formData.append("file_name", name)
  formData.append("image_data", blob)

  try {
    const endpoint = Config.wordpressUploadPrivateImageEndpoint

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    if (response.ok) {
      const responseData = await response.json()
      return responseData.url
    }
    throw new Error()
  } catch (error) {
    captureException(error)
    throw new Error()
  }
}
