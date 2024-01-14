import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const tagWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query TagWorks($tagName: String!, $offset: Int!, $limit: Int!) {
    tag(name: $tagName) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
