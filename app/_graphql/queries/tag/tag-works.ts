import { gql } from "@/_graphql/__generated__"

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
