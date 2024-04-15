import { format } from "date-fns"
import { zipSync } from "fflate"

interface FileObject {
  name: string
  data: Uint8Array
}

/**
 * 画像をダウンロードする
 * @param files ファイルの名とデータの配列
 */
export const downloadImageFile = async (data: FileObject): Promise<void> => {
  try {
    const linkNode = document.createElement("a")

    linkNode.href = URL.createObjectURL(new Blob([data.data]))

    const now = new Date()

    const formattedDate = format(now, "yyyyMMddHHmmss")

    linkNode.download = `images_${formattedDate}.png`

    document.body.appendChild(linkNode)

    linkNode.click()

    document.body.removeChild(linkNode)

    URL.revokeObjectURL(linkNode.href)
  } catch (error) {
    console.error(error)
    // captureException(error)
    throw new Error("ファイルのダウンロードに失敗しました。")
  }
}
