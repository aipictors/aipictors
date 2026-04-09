import { getWeekOfMonth } from "~/utils/get-weeks-in-month"
import { getJstDate } from "~/utils/jst-date"

type MonthlyInput = {
  kind: "monthly"
  year: number
  month: number
  pathnamePrefix: string
}

type DailyInput = {
  kind: "daily"
  year: number
  month: number
  day: number
  pathnamePrefix: string
}

type WeeklyInput = {
  kind: "weekly"
  year: number
  month: number
  week: number
  pathnamePrefix: string
}

type Input = MonthlyInput | DailyInput | WeeklyInput

const toMonthValue = (year: number, month: number) => year * 100 + month

export const getFutureRankingRedirectPath = (
  requestUrl: string,
  input: Input,
): string | null => {
  const url = new URL(requestUrl)
  const now = getJstDate()
  const yesterday = getJstDate(new Date(now.getTime() - 24 * 60 * 60 * 1000))

  if (input.kind === "monthly") {
    const currentMonthValue = toMonthValue(
      now.getFullYear(),
      now.getMonth() + 1,
    )
    const requestedMonthValue = toMonthValue(input.year, input.month)

    if (requestedMonthValue < currentMonthValue) {
      return null
    }

    const latestMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    url.pathname = `${input.pathnamePrefix}/${latestMonthDate.getFullYear()}/${latestMonthDate.getMonth() + 1}`
    return `${url.pathname}${url.search}`
  }

  if (input.kind === "daily") {
    const requestedDate = new Date(input.year, input.month - 1, input.day)
    const latestDate = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    )

    if (requestedDate <= latestDate) {
      return null
    }

    url.pathname = `${input.pathnamePrefix}/${yesterday.getFullYear()}/${yesterday.getMonth() + 1}/${yesterday.getDate()}`
    return `${url.pathname}${url.search}`
  }

  const requestedMonthValue = toMonthValue(input.year, input.month)
  const latestMonthValue = toMonthValue(
    yesterday.getFullYear(),
    yesterday.getMonth() + 1,
  )
  const latestWeek = getWeekOfMonth(
    yesterday.getFullYear(),
    yesterday.getMonth() + 1,
    yesterday.getDate(),
  )

  const isFutureWeek =
    requestedMonthValue > latestMonthValue ||
    (requestedMonthValue === latestMonthValue && input.week > latestWeek)

  if (!isFutureWeek) {
    return null
  }

  url.pathname = `${input.pathnamePrefix}/${yesterday.getFullYear()}/${yesterday.getMonth() + 1}/weeks/${latestWeek}`
  return `${url.pathname}${url.search}`
}
