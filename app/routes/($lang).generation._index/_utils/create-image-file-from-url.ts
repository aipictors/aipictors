interface FileObject {
  name: string
  data: Uint8Array
}

type Props = {
  /**
   * URL
   */
  url: string
  /**
   * name
   */
  name?: string
}

/**
 * 画像ファイルを作成する
 */
export async function createImageFileFromUrl(props: Props) {
  try {
    const response = await fetch(props.url)

    const blob = await response.blob()

    const arrayBuffer = await blob.arrayBuffer()

    return {
      name: `${props.name ? props.name : "file"}.png`,
      data: new Uint8Array(arrayBuffer),
    }
  } catch (error) {
    throw new Error("ファイルの取得に失敗しました。")
  }
}
