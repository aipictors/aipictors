import { gql } from "@/_graphql/__generated__"

/**
 * スタンプ総数
 */
export const stickersCountQuery = gql(`
  query StickersCount($where: StickersWhereInput) {
    stickersCount(where: $where)
  }
`)
