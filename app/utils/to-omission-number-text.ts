import { useTranslation } from "~/hooks/use-translation"

/**
 * 数字を省略表記に変換する
 * @param value 数値
 */
export const toOmissionNumberText = (value: number) => {
  const t = useTranslation() // 翻訳フックを使用

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
    return `${formattedValue}${t("万", "K")}` // 日本語なら「万」、英語なら「K」
  }

  const formattedValue = (value / 100000000)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.[1-9])0$/, "$1") // 小数点以下2桁を残し、.00や.10を削除

  return `${formattedValue}${t("億", "M")}` // 日本語なら「億」、英語なら「M」
}
