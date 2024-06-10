import { graphql } from "gql.tada"

export const foldersCountQuery = graphql(
  `query FoldersCount($where: FoldersWhereInput) {
    foldersCount(where: $where)
  }`,
)
