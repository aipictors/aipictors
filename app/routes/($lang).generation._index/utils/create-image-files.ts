import { fetchPublic } from "~/utils/fetch-public"
import { getDownloadProxyUrl } from "~/routes/($lang).generation._index/utils/get-download-proxy-url"

interface FileObject {
  name: string
  data: Uint8Array
}

function getImageExtensionFromMimeType(
  mimeType: string,
): "png" | "webp" | "jpg" {
  const lower = mimeType.toLowerCase()
  if (lower.includes("image/webp")) return "webp"
  if (lower.includes("image/jpeg") || lower.includes("image/jpg")) return "jpg"
  return "png"
}

type Props = {
  /**
   * 画像のID
   */
  imageIds: string[]
  /**
   * DOMのセレクタを作成する
   * @param id
   */
  toSelector(id: string): string
  /**
   * data属性名
   * @param id
   */
  dataName?: string
}

/**
 * 画像ファイルを作成する
 */
export async function createImageFiles(props: Props) {
  try {
    const files: FileObject[] = []

    for (const imageId of props.imageIds) {
      const imageElement = document.querySelector<HTMLImageElement>(
        props.toSelector(imageId),
      )

      if (imageElement === null) {
        continue
      }

      const dataName = props.dataName
        ? imageElement.dataset[props.dataName]
        : imageElement.src

      if (typeof dataName === "undefined") {
        continue
      }

      const response = await fetchPublic(getDownloadProxyUrl(dataName))

      if (!response.ok) {
        throw new Error(`画像の取得に失敗しました: ${dataName}`)
      }

      const blob = await response.blob()

      const contentType =
        response.headers.get("content-type") ?? blob.type ?? ""
      if (!contentType.toLowerCase().startsWith("image/")) {
        let head = ""
        try {
          head = (await blob.text()).slice(0, 120)
        } catch {
          head = ""
        }
        throw new Error(
          `画像形式ではありません: ${dataName} (content-type: ${contentType || "unknown"}) ${head}`,
        )
      }

      const extension = getImageExtensionFromMimeType(contentType)

      const arrayBuffer = await blob.arrayBuffer()

      files.push({
        name: `${imageId}.${extension}`,
        data: new Uint8Array(arrayBuffer),
      })
    }

    return files
  } catch (error) {
    console.error(error)
    // captureException(error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error("ファイルの圧縮に失敗しました。")
  }
}
