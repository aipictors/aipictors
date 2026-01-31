import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  format,
} from "date-fns"

/**
 * 指定された日時を指定された分単位で丸める
 * @param date - 対象の日時
 * @param roundToMinutes - 丸める分単位 (例: 10, 5, 1)
 */
const roundToNearestMinutes = (date: Date, roundToMinutes: number): Date => {
  const msInMinute = 60000
  const roundToMs = roundToMinutes * msInMinute
  const roundedTime = Math.round(date.getTime() / roundToMs) * roundToMs
  return new Date(roundedTime)
}

/**
 * 経過した時間を表す文字列を返す
 * @param createdAt - UNIXタイムスタンプ (秒単位)
 */
export const toElapsedTimeText: (createdAt: number) => string = (
  createdAt: number,
): string => {
  const roundToMinutesUnit = 3
  const now = roundToNearestMinutes(new Date(), roundToMinutesUnit)
  const targetDate = roundToNearestMinutes(
    new Date(createdAt * 1000),
    roundToMinutesUnit,
  ) // 対象時刻を丸める

  const months = differenceInMonths(now, targetDate)

  if (12 < months) {
    return format(targetDate, "yyyy/MM/dd HH:mm")
  }

  if (0 < months) {
    return `${months}ヶ月前`
  }

  const days = differenceInDays(now, targetDate)

  if (30 < days) {
    return format(targetDate, "yyyy年MM月dd日 HH時mm分")
  }

  if (0 < days) {
    return `${days}日前`
  }

  const hours = differenceInHours(now, targetDate)

  if (0 < hours) {
    return `${hours}時間前`
  }

  const minutes = differenceInMinutes(now, targetDate)

  return `${minutes}分前`
}
