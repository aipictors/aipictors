import { gql } from "@apollo/client"

export const VIEWER_ALBUMS = gql`
  query ViewerAlbums($offset: Int!, $limit: Int!) {
    viewer {
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`
