import { gql } from "@/_graphql/__generated__"

export const albumsCountQuery = gql(`
  query AlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }
`)
