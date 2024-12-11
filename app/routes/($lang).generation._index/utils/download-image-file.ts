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

    // PNGと仮定して拡張子を付与
    linkNode.download = `${fileName}_${formattedDate}.png`

    document.body.appendChild(linkNode)
    linkNode.click()
    document.body.removeChild(linkNode)

    URL.revokeObjectURL(linkNode.href)
  } catch (error) {
    console.error(error)
    // 必要に応じてUI上のエラーメッセージ表示
  }
}
