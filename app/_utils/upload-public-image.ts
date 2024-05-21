/**
 * 画像アップロード
 * @param base64 base64形式の画像（data URL形式）
 * @returns アップロードした画像URL
 */
export const uploadPublicImage = async (base64: string): Promise<string> => {
  const url = "http://127.0.0.1:8787" // APIのエンドポイントを指定
  const maxSize = 32 * 1024 * 1024 // 32MB

  // base64形式からプレフィックスとデータ部分に分割
  const base64Parts = base64.split(",")
  if (base64Parts.length !== 2) {
    alert("Invalid base64 string.")
    return ""
  }

  const mimeTypeMatch = base64Parts[0].match(/data:(.*?);base64/)
  if (!mimeTypeMatch) {
    alert("Invalid base64 string.")
    return ""
  }

  const mimeType = mimeTypeMatch[1]
  const base64String = base64Parts[1]

  // 画像のサイズチェック
  const byteSize = atob(base64String).length
  if (byteSize > maxSize) {
    alert("Please select a file smaller than 32 MB.")
    return ""
  }

  // MIMEタイプをチェック（ここでは例として image/webp と video/mp4 をチェック）
  const validMimeTypes = ["image/webp", "video/mp4"]
  if (!validMimeTypes.includes(mimeType)) {
    alert("Please use files that are uploadable.")
    return ""
  }

  // APIリクエストの送信
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64 }),
    })

    console.log("Response:", response)

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const data = await response.json()
    console.log("Success:", data)
    return ""
  } catch (error) {
    console.error("Error:", error)
    return ""
  }
}
