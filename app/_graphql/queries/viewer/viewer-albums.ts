import { partialAlbumFieldsFragment } from "@/_graphql/fragments/partial-album-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのシリーズ
 */
export const viewerAlbumsQuery = graphql(
  `query ViewerAlbums($offset: Int!, $limit: Int!) {
    viewer {
      albums(offset: $offset, limit: $limit) {
        ...PartialAlbumFields
      }
    }
  }`,
  [partialAlbumFieldsFragment],
)
