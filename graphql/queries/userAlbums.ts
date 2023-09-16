import { gql } from "@apollo/client"

export const USER_ALBUMS = gql`
  query UserAlbums($user_id: ID!, $offset: Int!, $limit: Int!) {
    user(id: $user_id) {
      id
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`
