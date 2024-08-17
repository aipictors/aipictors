import { format } from "date-fns"

/**
 * 日付のテキストを返す
 * @param time
 */
export function toDateText(time: number) {
  const date = new Date(time * 1000)
  return format(date, "yyyy年MM月dd日 HH時mm分")
}
