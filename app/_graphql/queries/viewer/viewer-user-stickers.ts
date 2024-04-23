import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザのスタンプ
 */
export const viewerUserStickersQuery = gql(`
  query ViewerUserStickers($offset: Int!, $limit: Int!, $orderBy: StickerOrderBy) {
    viewer {
      userStickers(offset: $offset, limit: $limit, orderBy: $orderBy) {
        ...PartialStickerFields
      }
    }
  }
`)
