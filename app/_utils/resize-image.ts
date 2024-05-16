/**
 * 画像のリサイズ
 * @param imageBase64 base64形式の画像
 * @param width 固定する幅（オプション）
 * @param height 固定する高さ（オプション）
 * @returns リサイズされた画像のbase64形式
 */
const resizeImage = (
  imageBase64: string,
  width?: number,
  height?: number,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = imageBase64
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (width) {
        canvas.width = width
        canvas.height = (img.height / img.width) * width
      } else if (height) {
        canvas.height = height
        canvas.width = (img.width / img.height) * height
      } else {
        reject(new Error("Width or height must be specified"))
        return
      }

      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL("image/png"))
      } else {
        reject(new Error("Failed to get canvas context"))
      }
    }
    img.onerror = reject
  })
}
