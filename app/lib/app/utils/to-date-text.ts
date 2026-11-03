import { formatDate } from "~/utils/format-date"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * 日付のテキストを返す
 * @param time
 */
export function toDateText(time: number): string {
  const date = toJstDisplayDate(time * 1000)
  return formatDate(date, "yyyy年MM月dd日 HH時mm分")
}
