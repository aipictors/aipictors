/**
 * 数字を省略表記に変換する
 * @param value 数値
 */
export const toOmissionNumberText = (value: number) => {
  const formatNumber = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  if (value < 10000) {
    return formatNumber(value)
  }
  if (value < 100000000) {
    return `${formatNumber(Math.floor(value / 10000))}万`
  }
  return `${formatNumber(Math.floor(value / 100000000))}億`
}
