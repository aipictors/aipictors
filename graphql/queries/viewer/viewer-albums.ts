import { partialAlbumFieldsFragment } from "@/graphql/fragments/partial-album-fields"
import { gql } from "@apollo/client"

export const viewerAlbumsQuery = gql`
  ${partialAlbumFieldsFragment}
  query ViewerAlbums($offset: Int!, $limit: Int!) {
    viewer {
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`
