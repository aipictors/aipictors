import { differenceInDays } from "date-fns/differenceInDays"
import { differenceInHours } from "date-fns/differenceInHours"
import { differenceInMinutes } from "date-fns/differenceInMinutes"
import { differenceInMonths } from "date-fns/differenceInMonths"
import { differenceInSeconds } from "date-fns/differenceInSeconds"
import { formatDate } from "~/utils/format-date"
import { getRenderNow } from "~/utils/render-now"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * 経過時間のテキストを返す
 * @param createdAt
 */
export function toElapsedTimeText(createdAt: number): string {
  const dateLeft = toJstDisplayDate(getRenderNow())

  const dateRight = toJstDisplayDate(createdAt * 1000)

  const months = differenceInMonths(dateLeft, dateRight)

  if (12 < months) {
    return formatDate(dateRight, "yyyy年MM月dd日 HH時mm分")
  }

  if (0 < months) {
    return `${months}ヶ月前`
  }

  const days = differenceInDays(dateLeft, dateRight)

  if (30 < days) {
    return formatDate(dateRight, "yyyy年MM月dd日 HH時mm分")
  }

  if (0 < days) {
    return `${days}日前`
  }

  const hours = differenceInHours(dateLeft, dateRight)

  if (0 < hours) {
    return `${hours}時間前`
  }

  const minutes = differenceInMinutes(dateLeft, dateRight)

  if (0 < minutes) {
    return `${minutes}分前`
  }

  const seconds = differenceInSeconds(dateLeft, dateRight)

  return `${seconds}秒前`
}
