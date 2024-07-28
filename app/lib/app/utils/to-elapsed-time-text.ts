import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  format,
} from "date-fns"

/**
 * 経過時間のテキストを返す
 * @param createdAt
 */
export const toElapsedTimeText = (createdAt: number) => {
  const dateLeft = new Date()

  const dateRight = new Date(createdAt * 1000)

  const months = differenceInMonths(dateLeft, dateRight)

  if (12 < months) {
    return format(dateRight, "yyyy年MM月dd日 HH時mm分")
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
