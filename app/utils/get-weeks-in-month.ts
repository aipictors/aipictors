/**
 * 指定された年月の週数を取得する（最大4週まで、月またぎを許可）
 * @param year 年
 * @param month 月（1-12）
 * @returns その月の週数（最大4週）
 */
export function getWeeksInMonth(year: number, month: number): number {
  // 月の最初の日
  const firstDay = new Date(year, month - 1, 1)
  // 月の最初の日の曜日 (0=日曜日, 1=月曜日, ...)
  const firstDayOfWeek = firstDay.getDay()

  // 月の日数
  const daysInMonth = new Date(year, month, 0).getDate()

  // 最初の週に含まれる日数（日曜日基準）
  const daysInFirstWeek = 7 - firstDayOfWeek

  // 残りの日数
  const remainingDays = daysInMonth - daysInFirstWeek

  // 追加の完全な週数
  const additionalWeeks = Math.ceil(remainingDays / 7)

  // 総週数（最初の週 + 追加の週）だが、最大4週まで
  const totalWeeks = 1 + additionalWeeks
  return Math.min(totalWeeks, 4)
}

/**
 * 指定された日付が何週目かを取得する（最大4週まで、月またぎを考慮）
 * @param year 年
 * @param month 月（1-12）
 * @param day 日
 * @returns 週番号（1から4まで）
 */
export function getWeekOfMonth(
  year: number,
  month: number,
  day: number,
): number {
  // 月の最初の日
  const firstDay = new Date(year, month - 1, 1)
  // 月の最初の日の曜日（0=日曜日）
  const firstDayOfWeek = firstDay.getDay()

  // 指定された日付から週番号を計算
  // 日にち + 月初の曜日から何週目かを計算
  const weekNumber = Math.ceil((day + firstDayOfWeek) / 7)

  // 最大4週まで制限（5週目以降は4週目として扱う）
  return Math.min(weekNumber, 4)
}

/**
 * 指定された週番号の開始日と終了日を取得する
 * @param year 年
 * @param month 月（1-12）
 * @param week 週番号（1から開始）
 * @returns 週の開始日と終了日
 */
export function getWeekDateRange(
  year: number,
  month: number,
  week: number,
): {
  startDate: Date
  endDate: Date
} {
  // 月の最初の日
  const firstDay = new Date(year, month - 1, 1)
  // 月の最初の日の曜日（0=日曜日）
  const firstDayOfWeek = firstDay.getDay()

  // 指定された週の開始日を計算
  const startDay = (week - 1) * 7 - firstDayOfWeek + 1
  const endDay = Math.min(startDay + 6, new Date(year, month, 0).getDate())

  const startDate = new Date(year, month - 1, Math.max(1, startDay))
  const endDate = new Date(year, month - 1, endDay)

  return { startDate, endDate }
}
