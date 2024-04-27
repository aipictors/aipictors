/**
 * 画像URLからBase64文字列を取得する
 * @param url 画像URL
 * @returns
 */
export async function getBase64FromImageUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob() // レスポンスをBlobとして取得

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string) // 読み込み完了時にBase64文字列を返す
      reader.onerror = reject
      reader.readAsDataURL(blob) // BlobをDataURLに変換
    })
  } catch (error) {
    console.error("エラーが発生しました:", error)
    throw error
  }
}
