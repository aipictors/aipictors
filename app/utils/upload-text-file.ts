import { config } from "~/config"
import { object, string, safeParse, nullable } from "valibot"

/**
 * テキストファイルのアップロード（Markdown対応）
 * @param text テキストデータ
 * @param token 認証用トークン
 * @returns アップロードされたファイルのURL
 */
export const uploadTextFile = async (
  text: string,
  token: string | undefined | null,
): Promise<string> => {
  if (token === null || token === undefined) throw new Error("Token is not set")

  try {
    const base64data = text.split(",")[1]
    const type = (() => {
      if (text.includes("markdown")) return "text/markdown"
      if (text.includes("plain")) return "text/plain"
      return "application/octet-stream"
    })()

    const blob = new Blob(
      [Uint8Array.from(atob(base64data), (c) => c.charCodeAt(0))],
      { type },
    )

    const endpoint = config.uploader.uploadText

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
        throw new Error("テキストファイルのアップロードに失敗いたしました")
      }

      return validationResult.output.data.url
    }
  } catch (error) {
    console.error(error)
  }
  throw new Error("テキストファイルのアップロードに失敗いたしました")
}
