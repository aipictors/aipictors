/**
 * urlをもとにimage要素を作成
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", (error) => reject(error))
    // CodeSandboxでCORSエラーを回避するために必要
    image.setAttribute("crossOrigin", "anonymous")
    image.src = url
  })

/**
 * 画像リサイズを行い新たな画像urlを作成
 */
export default async function getResizedImg(
  imageSrc: string,
  width: number,
  height: number,
  fileExtension?: string,
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    return ""
  }

  // canvasサイズを設定
  canvas.width = width
  canvas.height = height

  // 画像をキャンバスに描画（リサイズ）
  ctx.drawImage(image, 0, 0, width, height)

  // canvasを画像に変換
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (file) => {
        if (file !== null) resolve(URL.createObjectURL(file))
      },
      `image/${fileExtension ?? "png"}`,
    )
  })
}
