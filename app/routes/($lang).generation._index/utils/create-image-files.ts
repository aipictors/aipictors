interface FileObject {
  name: string
  data: Uint8Array
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
        console.log(`Image element not found for taskId: ${imageId}`)
        continue
      }

      const dataName = props.dataName
        ? imageElement.dataset[props.dataName]
        : imageElement.src

      if (typeof dataName === "undefined") {
        console.log("dataName is undefined")
        continue
      }

      const response = await fetch(dataName)

      if (!response.ok) {
        throw new Error(`画像の取得に失敗しました: ${dataName}`)
      }

      const blob = await response.blob()

      const arrayBuffer = await blob.arrayBuffer()

      files.push({ name: `${imageId}.png`, data: new Uint8Array(arrayBuffer) })
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
