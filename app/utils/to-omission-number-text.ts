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
    const formattedValue = (value / 10000)
      .toFixed(2)
      .replace(/\.00$/, "")
      .replace(/(\.[1-9])0$/, "$1") // 小数点以下2桁を残し、.00や.10を削除
    return `${formattedValue}万`
  }
  const formattedValue = (value / 100000000)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.[1-9])0$/, "$1") // 小数点以下2桁を残し、.00や.10を削除
  return `${formattedValue}億`
}
