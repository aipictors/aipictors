import { partialAlbumFieldsFragment } from "@/graphql/fragments/partial-album-fields"
import { gql } from "@apollo/client"

export const userAlbumsQuery = gql`
  ${partialAlbumFieldsFragment}
  query UserAlbums($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`
