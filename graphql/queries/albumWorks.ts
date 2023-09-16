import { gql } from "@apollo/client"

export const ALBUM_WORKS = gql`
  query AlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit) {
        ...PartialWorkFields
      }
    }
  }
`
