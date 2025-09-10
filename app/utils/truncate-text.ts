/**
 * 指定した文字数で文字列を省略する
 * @param text 省略対象の文字列
 * @param maxLength 最大文字数
 * @returns 省略された文字列
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  return `${text.substring(0, maxLength)}...`
}
