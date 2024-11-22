type ResizeInfo = {
  base64: string
  width: number
  height: number
}

/**
 * WebPサポートのチェックを管理するモジュール
 */
const WebPChecker = (() => {
  const webPSupportPromise: Promise<boolean> = new Promise((resolve) => {
    const webPDataUrl =
      "data:image/webp;base64,UklGRiIAAABXRUJQVlA4TCEAAAAvAAAAAAfQ//73v/+BiOh/AAA="
    fetch(webPDataUrl)
      .then((response) => response.blob())
      .then((blob) => createImageBitmap(blob))
      .then(() => resolve(true))
      .catch(() => resolve(false))
  })

  const checkWebPSupport = (): Promise<boolean> => webPSupportPromise

  return {
    checkWebPSupport,
  }
})()

/**
 * 画像のリサイズ
 * @param imageBase64 base64形式の画像
 * @param width 固定する幅（オプション）
 * @param height 固定する高さ（オプション）
 * @param ext 拡張子（オプション）
 * @returns リサイズされた画像のbase64形式
 */
export const resizeImage = (
  imageBase64: string,
  width?: number,
  height?: number,
  ext?: string,
): Promise<ResizeInfo> => {
  return WebPChecker.checkWebPSupport().then((supported) => {
    const format: string = (() => {
      const requestedExt = ext ? ext.toLowerCase() : "png"
      if (requestedExt === "webp") {
        return supported ? "webp" : "jpeg"
      }
      return requestedExt
    })()

    const dataUrlToBlob = (dataUrl: string): Promise<Blob> => {
      const [header, data] = dataUrl.split(",")
      const mimeMatch = header.match(/:(.*?);/)
      const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream"
      const binary = atob(data)
      const array = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        array[i] = binary.charCodeAt(i)
      }
      return Promise.resolve(new Blob([array], { type: mime }))
    }

    return dataUrlToBlob(imageBase64).then((blob) => {
      return createImageBitmap(blob).then((imageBitmap) => {
        const aspectRatio = imageBitmap.width / imageBitmap.height
        const targetWidth = width
          ? width
          : height
            ? Math.round(height * aspectRatio)
            : imageBitmap.width
        const targetHeight = height
          ? height
          : width
            ? Math.round(width / aspectRatio)
            : imageBitmap.height

        const canvas = new OffscreenCanvas(targetWidth, targetHeight)
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          return Promise.reject(new Error("Failed to get canvas context"))
        }

        ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight)

        const quality = format === "jpeg" ? 0.92 : undefined
        return canvas
          .convertToBlob({ type: `image/${format}`, quality })
          .then((resizedBlob) => {
            return new Promise<ResizeInfo>((resolve, reject) => {
              const reader = new FileReader()
              reader.onloadend = () => {
                const resizedBase64 = reader.result as string
                resolve({
                  base64: resizedBase64,
                  width: targetWidth,
                  height: targetHeight,
                })
              }
              reader.onerror = () => {
                reject(new Error("Failed to convert resized image to base64"))
              }
              reader.readAsDataURL(resizedBlob)
            })
          })
      })
    })
  })
}
