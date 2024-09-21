import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInSeconds,
  format,
} from "date-fns"
import { useTranslation } from "~/hooks/use-translation"

/**
 * 経過時間のテキストを返す (Returns the elapsed time text)
 * @param createdAt
 */
export function toElapsedTimeText(createdAt: number) {
  const t = useTranslation()

  const dateLeft = new Date()
  const dateRight = new Date(createdAt * 1000)

  const months = differenceInMonths(dateLeft, dateRight)

  if (12 < months) {
    return format(dateRight, "yyyy年MM月dd日 HH時mm分")
  }

  if (0 < months) {
    return t(`${months}ヶ月前`, `${months} months ago`)
  }

  const days = differenceInDays(dateLeft, dateRight)

  if (30 < days) {
    return format(dateRight, "yyyy年MM月dd日 HH時mm分")
  }

  if (0 < days) {
    return t(`${days}日前`, `${days} days ago`)
  }

  const hours = differenceInHours(dateLeft, dateRight)

  if (0 < hours) {
    return t(`${hours}時間前`, `${hours} hours ago`)
  }

  const minutes = differenceInMinutes(dateLeft, dateRight)

  if (0 < minutes) {
    return t(`${minutes}分前`, `${minutes} minutes ago`)
  }

  const seconds = differenceInSeconds(dateLeft, dateRight)

  return t(`${seconds}秒前`, `${seconds} seconds ago`)
}
