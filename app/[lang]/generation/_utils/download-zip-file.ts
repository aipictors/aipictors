import { captureException } from "@sentry/nextjs"
import { format } from "date-fns"
import { zipSync } from "fflate"

interface FileObject {
  name: string
  data: Uint8Array
}

/**
 * 画像を圧縮してダウンロードする
 * @param files ファイルの名とデータの配列
 */
export const downloadZipFile = async (files: FileObject[]): Promise<void> => {
  try {
    if (files.length < 0) {
      throw new Error("No valid images found to download.")
    }

    const data = zipSync(
      Object.fromEntries(files.map((file) => [file.name, file.data])),
      {},
    )

    const zipBlob = new Blob([data], { type: "application/zip" })

    const linkNode = document.createElement("a")

    linkNode.href = URL.createObjectURL(zipBlob)

    const now = new Date()

    const formattedDate = format(now, "yyyyMMddHHmmss")

    linkNode.download = `images_${formattedDate}.zip`

    document.body.appendChild(linkNode)

    linkNode.click()

    document.body.removeChild(linkNode)

    URL.revokeObjectURL(linkNode.href)
  } catch (error) {
    console.error(error)
    captureException(error)
    throw new Error("Zipファイルのダウンロードに失敗しました。")
  }
}
