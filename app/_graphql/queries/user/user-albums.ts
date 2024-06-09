import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { graphql } from "gql.tada"

export const userAlbumsQuery = graphql(
  `query UserAlbums($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }`,
  [partialAlbumFieldsFragment],
)
