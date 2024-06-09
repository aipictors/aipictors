import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"

export const tagWorksQuery = graphql(
  `query TagWorks($tagName: String!, $offset: Int!, $limit: Int!) {
    tag(name: $tagName) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }`,
  [partialWorkFieldsFragment],
)
