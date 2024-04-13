import { config } from "@/config"

/**
 * 画像アップロード
 * @param image base64形式の画像
 * @param name ファイル名（拡張子含む）
 * @param nanoid ユーザID
 * @returns アップロードした画像URL（ログインユーザ以外からは閲覧できないので注意）
 */
export const uploadImage = async (
  image: string,
  name: string,
  nanoid: string,
): Promise<string> => {
  const blob = new Blob([image], { type: "text/plain" })
  const formData = new FormData()

  formData.append("file_name", name)
  formData.append("image_data", blob)
  formData.append("nanoid", nanoid)

  try {
    const endpoint = config.wordpressEndpoint.uploadPrivateImage

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      const responseData = (await response.json()) as any
      return responseData.url
    }
    throw new Error()
  } catch (error) {
    // captureException(error)
    throw new Error()
  }
}
