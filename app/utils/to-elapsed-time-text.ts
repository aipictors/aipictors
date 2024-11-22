import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  format,
} from "date-fns"

/**
 * 経過した時間を表す文字列を返す (Returns the elapsed time string)
 * @param createdAt
 */
export const toElapsedTimeText = (createdAt: number, date?: Date) => {
  const dateLeft = date ? date : new Date()

  const dateRight = new Date(createdAt * 1000)

  const months = differenceInMonths(dateLeft, dateRight)

  if (12 < months) {
    return format(dateRight, "yyyy/MM/dd HH:mm")
  }

  if (0 < months) {
    return `${months}ヶ月前`
  }

  const days = differenceInDays(dateLeft, dateRight)

  if (30 < days) {
    return format(dateRight, "yyyy年MM月dd日 HH時mm分")
  }

  if (0 < days) {
    return `${days}日前`
  }

  const hours = differenceInHours(dateLeft, dateRight)

  if (0 < hours) {
    return `${hours}時間前`
  }

  const minutes = differenceInMinutes(dateLeft, dateRight)

  return `${minutes}分前`
}
