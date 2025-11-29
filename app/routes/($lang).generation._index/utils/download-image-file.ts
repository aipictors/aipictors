import { format } from "date-fns"

export const downloadImageFile = async (
  fileName: string,
  imageUrl: string,
): Promise<void> => {
  if (!imageUrl) {
    console.error("画像が存在しません")
    return
  }

  try {
    // 画像URLからBlobを取得
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error("画像の取得に失敗しました")
    }

    const blob = await response.blob()

    const linkNode = document.createElement("a")
    linkNode.href = URL.createObjectURL(blob)

    const now = new Date()
    const formattedDate = format(now, "yyyyMMddHHmmss")

    // BlobのMIMEタイプから適切な拡張子を決定
    const mimeType = blob.type
    let extension = "png" // デフォルトはPNG

    if (mimeType === "image/webp") {
      extension = "webp"
    } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      extension = "jpg"
    } else if (mimeType === "image/png") {
      extension = "png"
    }

    linkNode.download = `${fileName}_${formattedDate}.${extension}`

    document.body.appendChild(linkNode)
    linkNode.click()
    document.body.removeChild(linkNode)

    URL.revokeObjectURL(linkNode.href)
  } catch (error) {
    console.error(error)
    // 必要に応じてUI上のエラーメッセージ表示
  }
}
