import type { FragmentOf } from "gql.tada"
import type { workArticleFragment } from "~/routes/($lang)._main.posts.$post._index/components/work-article-fragments"
import { formatDate } from "~/utils/format-date"
import { getWeeklyRankingPeriod } from "~/utils/get-weeks-in-month"

export const toDateTextUrl = (time: number, dateFormat: string) => {
  const date = new Date(time * 1000)
  return formatDate(date, dateFormat)
}

export const toAiRankingPath = (
  ranking:
    | FragmentOf<typeof workArticleFragment>["aiDailyRanking"]
    | FragmentOf<typeof workArticleFragment>["aiWeeklyRanking"]
    | FragmentOf<typeof workArticleFragment>["aiMonthlyRanking"],
) => {
  if (ranking === null || ranking === undefined) {
    return null
  }

  const pathnamePrefix = ranking.isSensitive ? "/r/ai-rankings" : "/ai-rankings"

  if (ranking.periodType === "daily") {
    return `${pathnamePrefix}/${ranking.dateText.replace(/-/g, "/")}`
  }

  if (ranking.periodType === "monthly") {
    const [year, month] = ranking.dateText.split("-")
    return `${pathnamePrefix}/${year}/${month}`
  }

  const [yearText, monthText, dayText] = ranking.dateText.split("-")
  const { year, month, weekIndex } = getWeeklyRankingPeriod(
    Number(yearText),
    Number(monthText),
    Number(dayText),
  )

  return `${pathnamePrefix}/${year}/${month}/weeks/${weekIndex}`
}

const isProbablyJapanese = (text: string) =>
  /[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF]/.test(text)

const isProbablyEnglish = (text: string) =>
  /[A-Za-z]/.test(text) &&
  !/[\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0400-\u04FF]/.test(
    text,
  )

export const detectLanguage = (text: string): "ja" | "en" | null => {
  if (isProbablyJapanese(text)) return "ja"
  if (isProbablyEnglish(text)) return "en"
  return null
}
