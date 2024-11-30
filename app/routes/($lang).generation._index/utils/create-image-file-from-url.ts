

interface FileObject {
  name: string
  data: Uint8Array
}

type FileExtension = "png" | "webp" | "jpeg" | "jpg";

type Props = {
  /**
   * URL
   */
  url: string
  /**
   * name
   */
  name?: string
  /**
   * Extension
   */
  extension?: FileExtension
}

/**
 * 画像ファイルを作成する
 * @param props URLやファイル名などの設定
 */
export async function createImageFileFromUrl(props: Props) {
  try {
    const response = await fetch(props.url)

    const blob = await response.blob()

    const extension = props.extension || "png"

    // Blob URL を作成
    const blobUrl = URL.createObjectURL(blob)

    // 画像を読み込む
    const img = new Image()
    img.src = blobUrl

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("画像の読み込みに失敗しました。"))
    })

    // Canvasを作成
    const canvas = document.createElement("canvas")
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext("2d")
    ctx?.drawImage(img, 0, 0)

    // Blob URL を解放
    URL.revokeObjectURL(blobUrl)

    // 指定された拡張子でBlobを作成
    const newBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            throw new Error("画像の変換に失敗しました。")
          }
        },
        `image/${extension}`
      )
    })

    const arrayBuffer = await newBlob.arrayBuffer()

    return {
      name: `${props.name ? props.name : "file"}.${extension}`,
      data: new Uint8Array(arrayBuffer),
    }
  } catch (error) {
    console.error(error)
    throw new Error("ファイルの取得に失敗しました。")
  }
}
