/**
 * 画像アップロード
 * @param image base64形式の画像
 * @param name ファイル名（拡張子含む）
 * @param id ユーザID
 * @returns アップロードした画像URL
 */
export const uploadPublicImage = async (
  image: string,
  name: string,
  id: string,
): Promise<string> => {
  const blob = new Blob([image], { type: "text/plain" })
  const formData = new FormData()

  formData.append("file_name", name)
  formData.append("image_data", blob)
  formData.append("id", id)

  try {
    // const endpoint = config.wordpressEndpoint.uploadPublicImage

    // const response = await fetch(endpoint, {
    //   method: "POST",
    //   body: formData,
    // })
    // if (response.ok) {
    //   // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    //   const responseData = (await response.json()) as any
    //   return responseData.url
    // }
    throw new Error()
  } catch (error) {
    // captureException(error)
    throw new Error()
  }
}
