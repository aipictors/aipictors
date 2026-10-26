const JST_OFFSET_SECONDS = 9 * 60 * 60

/**
 * 日本時間の各要素を取り出すためのフォーマッタ
 * ブラウザの表示言語に依存しないようにロケールを固定する
 */
const jstDateTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
})

/**
 * JSTかどうかを判断し、JSTならオフセットを考慮、そうでないならそのまま返す関数
 * （返り値のローカル時刻の各要素が日本時間の年月日時分秒になる）
 */
export const getJstDate: (data?: Date) => Date = (data?: Date): Date => {
  const date = data || new Date()
  const parts = jstDateTimeFormat.formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) => {
    return Number(parts.find((part) => part.type === type)?.value)
  }
  return new Date(
    getPart("year"),
    getPart("month") - 1,
    getPart("day"),
    getPart("hour"),
    getPart("minute"),
    getPart("second"),
  )
}

/**
 * 日本時間の壁時計をUTCとして扱ったUNIX秒に変換する
 * （イベントの startAt / endAt はこの形式で返却される）
 */
export const toJstWallClockUnixSeconds: (date?: Date) => number = (
  date?: Date,
): number => {
  return Math.floor((date || new Date()).getTime() / 1000) + JST_OFFSET_SECONDS
}

/**
 * 日本時間の日付（YYYY-MM-DD）と時刻（HH:mm）を、
 * 日本時間の壁時計をUTCとして扱ったUNIX秒に変換する
 */
export const jstDateTimeToWallClockUnixSeconds: (
  date: string,
  time: string,
) => number | null = (date: string, time: string): number | null => {
  const [year, month, day] = date.split("-").map(Number)
  const [hours, minutes] = time.split(":").map(Number)
  const value = Date.UTC(year, month - 1, day, hours, minutes)
  if (Number.isNaN(value)) {
    return null
  }
  return Math.floor(value / 1000)
}
