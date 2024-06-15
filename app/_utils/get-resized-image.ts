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
  fileExtension = "webp",
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

  // canvasを画像に変換してBase64形式で返す
  return new Promise((resolve, reject) => {
    try {
      const base64 = canvas.toDataURL(`image/${fileExtension ?? "png"}`)
      resolve(base64)
    } catch (error) {
      reject(new Error("Failed to convert canvas to Base64"))
    }
  })
}
