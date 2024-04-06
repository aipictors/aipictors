import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザのシリーズ
 */
export const viewerAlbumsQuery = gql(`
  query ViewerAlbums($offset: Int!, $limit: Int!) {
    viewer {
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }
`)
