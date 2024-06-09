import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのスタンプ総数
 */
export const viewerUserStickersCountQuery = graphql(
  `query ViewerUserStickersCount($where: UserStickersWhereInput) {
    viewer {
      userStickersCount(where: $where)
    }
  }`,
)
