export function createBase64FromImageURL(imageURL: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.setAttribute("crossOrigin", "anonymous")
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL("image/png")
        resolve(dataURL)
      } else {
        reject("ctx is null")
      }
    }
    img.src = imageURL
  })
}
