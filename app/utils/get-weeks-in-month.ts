const getMondayDates = (year: number, month: number) => {
  const dates: number[] = []
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month - 1, day)
    if (date.getDay() === 1) {
      dates.push(day)
    }
  }

  return dates
}

const getMondayDateForWeek = (year: number, month: number, weekIndex: number) => {
  const mondayDates = getMondayDates(year, month)
  const mondayDay = mondayDates[weekIndex - 1]

  if (mondayDay === undefined) {
    return null
  }

  return new Date(year, month - 1, mondayDay)
}

export function getWeeksInMonth(year: number, month: number): number {
  return getMondayDates(year, month).length
}

export function getWeekOfMonth(
  year: number,
  month: number,
  day: number,
): number {
  return getWeeklyRankingPeriod(year, month, day).weekIndex
}

export function getWeeklyRankingPeriod(
  year: number,
  month: number,
  day: number,
): {
  year: number
  month: number
  weekIndex: number
} {
  const targetDate = new Date(year, month - 1, day)
  const mondayDate = new Date(targetDate)
  mondayDate.setDate(targetDate.getDate() - ((targetDate.getDay() + 6) % 7))

  const mondayYear = mondayDate.getFullYear()
  const mondayMonth = mondayDate.getMonth() + 1
  const mondayDates = getMondayDates(mondayYear, mondayMonth)
  const mondayDay = mondayDate.getDate()
  const weekIndex = mondayDates.findIndex((value) => value === mondayDay) + 1

  return {
    year: mondayYear,
    month: mondayMonth,
    weekIndex: Math.max(weekIndex, 1),
  }
}

export function getLatestPublishedWeeklyPeriod(referenceDate = new Date()): {
  year: number
  month: number
  weekIndex: number
} {
  const currentDate = new Date(referenceDate)
  const mondayOfCurrentWeek = new Date(currentDate)
  mondayOfCurrentWeek.setDate(
    currentDate.getDate() - ((currentDate.getDay() + 6) % 7),
  )

  const latestPublishedWeekStart = new Date(mondayOfCurrentWeek)
  latestPublishedWeekStart.setDate(mondayOfCurrentWeek.getDate() - 7)

  return getWeeklyRankingPeriod(
    latestPublishedWeekStart.getFullYear(),
    latestPublishedWeekStart.getMonth() + 1,
    latestPublishedWeekStart.getDate(),
  )
}

export function getPreviousWeeklyPeriod(
  year: number,
  month: number,
  weekIndex: number,
): {
  year: number
  month: number
  weekIndex: number
} {
  const { startDate } = getWeekDateRange(year, month, weekIndex)
  const previousWeekDate = new Date(startDate)
  previousWeekDate.setDate(startDate.getDate() - 7)

  return getWeeklyRankingPeriod(
    previousWeekDate.getFullYear(),
    previousWeekDate.getMonth() + 1,
    previousWeekDate.getDate(),
  )
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
  const startDate = getMondayDateForWeek(year, month, week) ?? new Date(year, month - 1, 1)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  return { startDate, endDate }
}
