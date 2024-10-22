/**
 * カンマ区切りの金額の文字列に変換する
 * @param value
 */
export const toMoneyNumberText = (value: number) => {
  const [integerPart, decimalPart] = value.toString().split(".")

  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  return decimalPart
    ? `${formattedIntegerPart}.${decimalPart}`
    : formattedIntegerPart
}
