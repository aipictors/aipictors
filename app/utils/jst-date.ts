/**
 * JSTかどうかを判断し、JSTならオフセットを考慮、そうでないならそのまま返す関数
 */
export const getJstDate = (data?: Date) => {
  const date = data || new Date()
  const options = { timeZone: "Asia/Tokyo" }
  const str = date.toLocaleString(undefined, options)
  return new Date(str)
}
