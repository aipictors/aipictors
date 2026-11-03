import { differenceInDays } from "date-fns/differenceInDays"
import { differenceInHours } from "date-fns/differenceInHours"
import { differenceInMinutes } from "date-fns/differenceInMinutes"
import { differenceInMonths } from "date-fns/differenceInMonths"
import { formatDate } from "~/utils/format-date"
import { getRenderNow } from "~/utils/render-now"
import { toJstDisplayDate } from "~/utils/to-jst-display-date"

/**
 * 経過した時間を表す文字列を返す (Returns the elapsed time string)
 * @param createdAt
 */
export const toElapsedTimeEnText: (createdAt: number) => string = (
  createdAt: number,
): string => {
  const dateLeft = toJstDisplayDate(getRenderNow())

  const dateRight = toJstDisplayDate(createdAt * 1000)

  const months = differenceInMonths(dateLeft, dateRight)

  if (12 < months) {
    return formatDate(dateRight, "yyyy/MM/dd HH:mm")
  }

  if (0 < months) {
    return `${months} months ago`
  }

  const days = differenceInDays(dateLeft, dateRight)

  if (30 < days) {
    return formatDate(dateRight, "yyyy/MM/dd HH:mm")
  }

  if (0 < days) {
    return `${days} days ago`
  }

  const hours = differenceInHours(dateLeft, dateRight)

  if (0 < hours) {
    return `${hours} hours ago`
  }

  const minutes = differenceInMinutes(dateLeft, dateRight)

  return `${minutes} minutes ago`
}
