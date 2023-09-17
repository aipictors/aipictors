import { gql } from "@apollo/client"

export const DAILY_THEMES = gql`
  query DailyThemes(
    $offset: Int!
    $limit: Int!
    $where: DailyThemesWhereInput!
  ) {
    dailyThemes(offset: $offset, limit: $limit, where: $where) {
      id
      title
      dateText
      year
      month
      day
      worksCount
      firstWork {
        ...PartialWorkFields
      }
    }
  }
`
