import { format } from "date-fns"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * 日付のテキストを返す
 * @param time
 */
export function toDateText(time: number): string {
  const date = toJstDisplayDate(time * 1000)
  return format(date, "yyyy年MM月dd日 HH時mm分")
}
