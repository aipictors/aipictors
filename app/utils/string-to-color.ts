import { hashCode } from "~/utils/hash-code"

const SATURATION = 34
const MAX_LIGHTNESS = 56
const MIN_LIGHTNESS = 30

/**
 * HSL の色の相対輝度（WCAG）
 */
const toRelativeLuminance = (hue: number, saturation: number, lightness: number) => {
  const s = saturation / 100
  const l = lightness / 100
  const a = s * Math.min(l, 1 - l)
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    const value = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4)
}

/**
 * ハッシュ値を元にHSLカラーを生成
 * 白い文字を載せるので、どの色相でもコントラスト比 4.5 以上になる明るさまで下げる
 * （黄色や緑は同じ明るさでも明るく見えるため、色相ごとに明るさが変わる）
 * @param text
 * @returns
 */
export const stringToColor: (text: string, isDisabled: boolean) => string = (
  text: string,
  isDisabled: boolean,
): string => {
  if (isDisabled) {
    return "hsl(0, 0%, 45%)" // グレー色
  }

  const hash = hashCode(text)
  const hue = Math.abs(hash) % 360
  let lightness = MAX_LIGHTNESS
  // 白とのコントラスト比 (1.05 / (L + 0.05)) が 4.6 以上（L <= 0.178）になるまで暗くする
  while (
    lightness > MIN_LIGHTNESS &&
    toRelativeLuminance(hue, SATURATION, lightness) > 0.178
  ) {
    lightness -= 1
  }
  return `hsl(${hue}, ${SATURATION}%, ${lightness}%)`
}
