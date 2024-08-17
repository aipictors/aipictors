/**
 * 日本時間の取得
 */
export const getJstDate = (data?: Date) => {
  if (!data) {
    return new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
  }
  return new Date(data.getTime() + 9 * 60 * 60 * 1000)
}
