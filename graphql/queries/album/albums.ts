import { partialAlbumFieldsFragment } from "@/graphql/fragments/partial-album-fields"
import { partialUserFieldsFragment } from "@/graphql/fragments/partial-user-fields"
import { gql } from "@apollo/client"

export const albumsQuery = gql`
  ${partialAlbumFieldsFragment}
  ${partialUserFieldsFragment}
  query Albums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PartialAlbumFields
      user {
        ...PartialUserFields
      }
    }
  }
`
