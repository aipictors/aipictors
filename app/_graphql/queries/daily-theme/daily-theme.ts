import { gql } from "@/_graphql/__generated__"

export const dailyThemeQuery = gql(`
  query DailyTheme($id: ID, $year: Int, $month: Int, $day: Int) {
    dailyTheme(id: $id, year: $year, month: $month, day: $day) {
      id
      title
      dateText
      year
      month
      day
      worksCount
    }
  }
`)
