import { gql } from "@/_graphql/__generated__"

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
