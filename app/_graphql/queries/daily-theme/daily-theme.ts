import { gql } from "@/_graphql/__generated__"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"

export const dailyThemeQuery = gql(`
  ${partialWorkFieldsFragment}
  query DailyTheme($id: ID!, $offset: Int!, $limit: Int!) {
    dailyTheme(id: $id) {
      id
      title
      dateText
      year
      month
      day
      worksCount
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)