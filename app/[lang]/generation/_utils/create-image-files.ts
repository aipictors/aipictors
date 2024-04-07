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
        throw new Error(`Image element not found for taskId: ${imageId}`)
      }

      const response = await fetch(
        props.dataName
          ? imageElement.dataset[props.dataName!]!
          : imageElement.src,
      )

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${
            props.dataName
              ? imageElement.dataset[props.dataName!]!
              : imageElement.src
          }`,
        )
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
