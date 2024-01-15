import { gql } from "@/graphql/__generated__"
import { partialAlbumFieldsFragment } from "@/graphql/fragments/partial-album-fields"

export const viewerAlbumsQuery = gql(`
  query ViewerAlbums($offset: Int!, $limit: Int!) {
    viewer {
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`)
