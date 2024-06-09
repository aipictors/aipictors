import { graphql } from "gql.tada"

export const albumsCountQuery = graphql(
  `query AlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }`,
)
