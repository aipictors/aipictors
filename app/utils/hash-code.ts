/**
 * 文字列からハッシュ値を生成
 * @param text
 * @returns
 */
export const hashCode: (text: string) => number = (text: string): number => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
