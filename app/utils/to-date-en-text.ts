import { format } from "date-fns"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * 時刻の文字列を返す
 * @param time
 */
export const toDateEnText: (time: number) => string = (
  time: number,
): string => {
  const date = toJstDisplayDate(time * 1000)
  return format(date, "yyyy/MM/dd")
}
