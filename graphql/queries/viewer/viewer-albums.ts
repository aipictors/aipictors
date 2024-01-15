import { gql } from "@/graphql/__generated__"

export const viewerAlbumsQuery = gql(`
  query ViewerAlbums($offset: Int!, $limit: Int!) {
    viewer {
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`)
