/**
 * data URL の中身のバイト数を返す。投稿済みの画像の URL などは大きさが分からないので null
 */
export const getDataUrlByteLength = (content: string): number | null => {
  // 数 MB の文字列を入力のたびにコピーしないよう、長さだけで数える
  if (!content.startsWith("data:")) {
    return null
  }
  const comma = content.indexOf(",")
  if (comma === -1 || !content.slice(0, comma).endsWith(";base64")) {
    return null
  }
  const end = content.trimEnd().length
  const length = end - comma - 1
  const padding =
    content[end - 1] === "=" ? (content[end - 2] === "=" ? 2 : 1) : 0
  return (length * 3) / 4 - padding
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
