import { config } from "@/config"

/**
 * アップロード済みの画像削除
 * @param image base64形式の画像
 * @returns 結果
 */
export const deleteUploadedImage = async (
  imageUrl: string,
): Promise<boolean> => {
  const formData = new FormData()

  formData.append("file_url", imageUrl)

  try {
    const endpoint = config.wordpressEndpoint.deleteUploadedImage

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })
    if (response.ok) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const responseData = (await response.json()) as any
      return responseData.result
    }
    throw new Error()
  } catch (error) {
    // captureException(error)
    throw new Error()
  }
}
