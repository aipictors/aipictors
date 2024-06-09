import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const dailyThemeQuery = graphql(
  `query DailyTheme($year: Int, $month: Int, $day: Int, $offset: Int!, $limit: Int!) {
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
  }`,
  [partialWorkFieldsFragment],
)
