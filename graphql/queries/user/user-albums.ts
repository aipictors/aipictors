import { gql } from "@/graphql/__generated__"
import { partialAlbumFieldsFragment } from "@/graphql/fragments/partial-album-fields"

export const userAlbumsQuery = gql(`
  query UserAlbums($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`)
