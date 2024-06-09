import { graphql } from "gql.tada"

/**
 * スタンプ総数
 */
export const stickersCountQuery = graphql(
  `query StickersCount($where: StickersWhereInput) {
    stickersCount(where: $where)
  }`,
)
