import { config } from "~/config"
import { object, string, safeParse, nullable } from "valibot"

/**
 * テキストファイルのアップロード（Markdown対応）
 * @param text テキストデータ
 * @param extension 拡張子（例: "md"、"txt"）
 * @param token 認証用トークン
 * @param existingUrl 既存のファイルURL（オプショナル）
 * @returns アップロードされたファイルのURL
 */
export const uploadTextFile = async (
  text: string,
  extension: string,
  token: string | undefined | null,
  existingUrl?: string, // 既存のファイル URL を指定するオプショナル引数
): Promise<string> => {
  if (token === null || token === undefined) throw new Error("Token is not set")

  try {
    // MIME タイプの推定
    const mimeType = (() => {
      switch (extension) {
        case "md":
          return "text/markdown"
        case "txt":
          return "text/plain"
        case "json":
          return "application/json"
        default:
          return "application/octet-stream"
      }
    })()

    // 普通のテキスト文字列を直接 Blob に変換
    const blob = new Blob([text], { type: mimeType })

    // 既存の URL が指定されている場合は、ファイル ID を抽出
    const fileId = existingUrl
      ? existingUrl.split("/").pop() || crypto.randomUUID()
      : crypto.randomUUID()

    // エンドポイント URL にファイル ID をクエリパラメータとして設定
    const endpoint = `${config.uploader.uploadText}?fileid=${fileId}`

    // PUT リクエストを送信してファイルをアップロード
    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": mimeType,
      },
      body: blob,
    })

    if (response.ok) {
      const responseData = await response.json()

      // Valibot でレスポンスデータのバリデーションを実行
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
    throw new Error(
      `アップロードに失敗しました。ステータスコード: ${response.status}`,
    )
  } catch (error) {
    console.error(error)
    throw new Error("テキストファイルのアップロードに失敗いたしました")
  }
}
