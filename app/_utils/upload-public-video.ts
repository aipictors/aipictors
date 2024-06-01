import { config } from "@/config"

/**
 * 画像アップロード
 * @param file Blob形式のファイル
 * @param name ファイル名（拡張子含む）
 * @param id ユーザID
 * @returns アップロードした画像URL
 */
export const uploadPublicVideo = async (
  file: Blob,
  name: string,
  id: string,
): Promise<string> => {
  const formData = new FormData()

  formData.append("id", id)
  formData.append("file", file, name)

  try {
    const endpoint = config.wordpressEndpoint.uploadPublicVideo

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    })

    if (response.ok) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const responseData = (await response.json()) as any
      return responseData.url
    }
    throw new Error("Upload failed")
  } catch (error) {
    // captureException(error)
    throw new Error("Error uploading video")
  }
}
