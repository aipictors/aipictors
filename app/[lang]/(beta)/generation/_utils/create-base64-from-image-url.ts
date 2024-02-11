/**
 * 画像URLからBase64を生成する
 * @param imageURL
 * @returns
 */
export function createBase64FromImageURL(imageURL: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute("crossOrigin", "anonymous")
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject("ctx is null")
        return
      }
      ctx.drawImage(img, 0, 0)
      const dataURL = canvas.toDataURL("image/png")
      resolve(dataURL)
    }
    img.onerror = () => {
      reject("Failed to load image")
    }
    img.src = imageURL
  })
}
