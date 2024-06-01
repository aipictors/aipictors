import { format } from "date-fns"

/**
 * 時刻の文字列を返す
 * @param time
 */
export const toDateTimeText = (time: number) => {
  const date = new Date(time * 1000)
  return format(date, "yyyy年MM月dd日 HH時mm分")
}
