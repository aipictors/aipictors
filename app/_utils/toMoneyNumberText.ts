/**
 * カンマ区切りの金額の文字列に変換する
 * @param value
 * @returns
 */
export const toMoneyNumberText = (value: number) => {
  // TODO: 小数点に対応する
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
