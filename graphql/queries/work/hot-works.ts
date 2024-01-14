import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const hotWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query HotWorks {
    hotWorks {
      ...PartialWorkFields
    }
  }
`
