import { formatDate } from "~/utils/format-date"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * 時刻の文字列を返す
 * @param time
 */
export const toDateText: (time: number) => string = (time: number): string => {
  const date = toJstDisplayDate(time * 1000)
  return formatDate(date, "yyyy年MM月dd日")
}
