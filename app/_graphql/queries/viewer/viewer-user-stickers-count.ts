import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザのスタンプ総数
 */
export const viewerUserStickersCountQuery = gql(`
  query ViewerUserStickersCount($where: UserStickersWhereInput) {
    viewer {
      userStickersCount(where: $where)
    }
  }
`)
