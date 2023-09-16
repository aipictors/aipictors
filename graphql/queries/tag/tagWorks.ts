import { gql } from "@apollo/client"

export const TAG_WORKS = gql`
  query TagWorks($tagName: String!, $offset: Int!, $limit: Int!) {
    tag(name: $tagName) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
