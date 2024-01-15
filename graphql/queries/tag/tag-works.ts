import { gql } from "@/graphql/__generated__"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"

export const tagWorksQuery = gql(`
  query TagWorks($tagName: String!, $offset: Int!, $limit: Int!) {
    tag(name: $tagName) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`)
