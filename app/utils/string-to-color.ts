import { hashCode } from "~/utils/hash-code"

/**
 * ハッシュ値を元にHSLカラーを生成
 * @param text
 * @returns
 */
export const stringToColor = (text: string, isDisabled: boolean) => {
  if (isDisabled) {
    return "hsl(0, 0%, 50%)" // グレー色
  }

  const hash = hashCode(text)
  const hue = Math.abs(hash) % 360
  const saturation = 32
  const lightness = 64
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}
