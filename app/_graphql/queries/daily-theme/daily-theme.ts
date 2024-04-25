import { gql } from "@/_graphql/__generated__"

export const dailyThemeQuery = gql(`
  query DailyTheme($year: Int, $month: Int, $day: Int, $offset: Int!, $limit: Int!) {
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      dateText
      year
      month
      day
      worksCount,
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
