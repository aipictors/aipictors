import { gql } from "@/_graphql/__generated__"

export const albumsQuery = gql(`
  query Albums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...PartialAlbumFields
      user {
        ...PartialUserFields
      }
    }
  }
`)
