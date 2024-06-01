type SizeInfo = {
  width: number
  height: number
}

/**
 * 画像のサイズ情報取得
 * @param imageBase64 base64形式の画像
 * @returns サイズ情報
 */
export const getSizeFromBase64 = (imageBase64: string): Promise<SizeInfo> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = imageBase64
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      })
    }
    img.onerror = reject
  })
}
