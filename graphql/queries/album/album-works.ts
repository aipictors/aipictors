import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { gql } from "@apollo/client"

export const albumWorksQuery = gql`
  ${partialWorkFieldsFragment}
  query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
