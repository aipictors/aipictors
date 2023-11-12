import { gql } from "@apollo/client"

export default gql`
  query UserAlbums($userId: ID!, $offset: Int!, $limit: Int!) {
    user(id: $userId) {
      id
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`
