/**
 * data URL の中身のバイト数を返す。投稿済みの画像の URL などは大きさが分からないので null
 */
export const getDataUrlByteLength = (content: string): number | null => {
  const matched = content.match(/^data:[^,]*;base64,(.*)$/s)
  if (!matched) {
    return null
  }
  const base64 = matched[1].replace(/\s/g, "")
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0
  return (base64.length * 3) / 4 - padding
}

/**
 * 選択中の画像の合計サイズの表示。
 * 編集画面の投稿済みの画像は URL で持っていて大きさが分からないので、1 枚でも混ざっていれば出さない
 */
export const getImageItemsSizeText = (
  contents: (string | null | undefined)[],
): string | null => {
  let totalBytes = 0
  for (const content of contents) {
    if (!content) {
      continue
    }
    const byteLength = getDataUrlByteLength(content)
    if (byteLength === null) {
      return null
    }
    totalBytes += byteLength
  }

  if (totalBytes < 1024 * 1024) {
    return `${(totalBytes / 1024).toFixed(2)} KB`
  }
  return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`
}
