import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const dailyThemesQuery = gql`
  ${partialWorkFieldsFragment}
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
