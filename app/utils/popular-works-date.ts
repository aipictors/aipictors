/**
 * 今日の人気作品（毎日お昼に API が選ぶ、全年齢・R18 それぞれ 100 件）の日付まわり
 * 日付は日本時間の "YYYY-MM-DD"
 */

/** これより前の日付は選べないようにする（集計が残っている最初のころ） */
export const POPULAR_WORKS_FIRST_DATE = "2023-01-01"

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * 日本時間の日付（YYYY-MM-DD）
 * @param date
 */
export function toJstDateString(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000)
  return jst.toISOString().slice(0, 10)
}

/**
 * 日付を days 日ずらす
 * @param dateString YYYY-MM-DD
 * @param days
 */
export function shiftDateString(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * URL の ?date= を確かめる。正しくない・範囲の外なら null
 * @param value
 * @param today 日本時間の今日
 */
export function parsePopularWorksDate(
  value: string | null | undefined,
  today: string,
): string | null {
  if (typeof value !== "string") return null
  const match = DATE_PATTERN.exec(value)
  if (match === null) return null
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  // 2026-02-31 などのありえない日付を除く
  if (date.toISOString().slice(0, 10) !== value) return null
  if (value < POPULAR_WORKS_FIRST_DATE || today < value) return null
  return value
}

/**
 * 人気作品のページのパス
 * @param props
 */
export function toPopularWorksPath(props: {
  isSensitive: boolean
  date?: string | null
}): string {
  const pathname = props.isSensitive ? "/r/popular" : "/popular"
  return props.date ? `${pathname}?date=${props.date}` : pathname
}

/**
 * 「今日の(R18)人気作品に選ばれました！：YYYY-MM-DD」の通知から、その日の人気作品のページのパスを作る
 * 人気作品の通知でなければ null
 * @param message
 */
export function toPopularWorksPathFromNotification(
  message: string | null | undefined,
): string | null {
  if (typeof message !== "string") return null
  const match = /(R18)?人気作品に選ばれました.*?(\d{4}-\d{2}-\d{2})/.exec(
    message,
  )
  if (match === null) return null
  return toPopularWorksPath({
    isSensitive: match[1] !== undefined,
    date: match[2],
  })
}
