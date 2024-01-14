import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const viewerWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query ViewerWorks($offset: Int!, $limit: Int!) {
    viewer {
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
