/**
 * 投稿画面で選んだ静止画を、投稿する画像の data URL にする。
 *
 * 前は FileReader で data URL にしてから Image で読み、canvas.toDataURL で書き出していた。
 * toDataURL は書き出しが終わるまで画面が止まり、iPhone の Safari は WebP を書き出せず
 * 元の大きさの PNG（数十 MB の文字列）になるので、スマートフォンでは選んでから出るまでがとても遅かった。
 * - 読み込みは createImageBitmap（画面を止めずに展開する）
 * - 書き出しは canvas.toBlob（画面を止めない）
 * - WebP を書き出せないブラウザでは、JPEG は JPEG のまま（PNG にすると何倍にもなる）、それ以外は PNG
 * どの場合も描き直すので、写真の位置情報や PNG の生成情報は今まで通り残らない
 */

let canEncodeWebpCache: boolean | null = null

/** canvas で WebP を書き出せるか（iPhone の Safari は書き出せない） */
const canEncodeWebp = () => {
  if (canEncodeWebpCache === null) {
    const canvas = document.createElement("canvas")
    canvas.width = 1
    canvas.height = 1
    canEncodeWebpCache = canvas
      .toDataURL("image/webp")
      .startsWith("data:image/webp")
  }
  return canEncodeWebpCache
}

type DecodedImage = {
  source: CanvasImageSource
  width: number
  height: number
  close(): void
}

const decodeImage = async (file: Blob): Promise<DecodedImage> => {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      }
    } catch {
      // BMP など createImageBitmap が読めないときは Image で読む
    }
  }

  const url = URL.createObjectURL(file)
  const img = new Image()
  try {
    img.src = url
    await img.decode()
  } catch {
    URL.revokeObjectURL(url)
    throw new Error("Failed to load image")
  }
  return {
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    close: () => URL.revokeObjectURL(url),
  }
}

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }
        reject(new Error("Failed to encode image"))
      },
      type,
      quality,
    )
  })

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
        return
      }
      reject(new Error("Failed to read image"))
    }
    reader.onerror = () => reject(new Error("Failed to read image"))
    reader.readAsDataURL(blob)
  })

export type PostImageDataUrl = {
  dataUrl: string
  width: number
  height: number
}

/** 静止画を投稿用の data URL（WebP、書き出せないブラウザでは JPEG / PNG）にする */
export async function toPostImageDataUrl(
  file: Blob,
): Promise<PostImageDataUrl> {
  const image = await decodeImage(file)
  try {
    const canvas = document.createElement("canvas")
    canvas.width = image.width
    canvas.height = image.height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Failed to get canvas context")
    }
    ctx.drawImage(image.source, 0, 0)

    const blob = canEncodeWebp()
      ? await canvasToBlob(canvas, "image/webp")
      : file.type === "image/jpeg"
        ? await canvasToBlob(canvas, "image/jpeg", 0.92)
        : await canvasToBlob(canvas, "image/png")

    // メモリを早めに返す（スマートフォンで何枚も選んだときに落ちないように）
    canvas.width = 0
    canvas.height = 0

    return {
      dataUrl: await blobToDataUrl(blob),
      width: image.width,
      height: image.height,
    }
  } finally {
    image.close()
  }
}
