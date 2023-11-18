/**
 * カレンダーのセルを作成する
 * @param year
 * @param month
 * @returns
 */
export const createCalendarCells = (year: number, month: number) => {
  const first = new Date(year, month - 1, 1).getDay()

  const last = new Date(year, month, 0).getDate()

  return [0, 1, 2, 3, 4, 5].flatMap((weekIndex) => {
    return [0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
      const day = dayIndex + 1 + weekIndex * 7
      return day - 1 < first || last < day - first ? null : day - first
    })
  })
}
