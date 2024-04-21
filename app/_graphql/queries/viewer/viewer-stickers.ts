import { gql } from "@/_graphql/__generated__"

/**
 * ログイン中のユーザのスタンプ
 */
export const viewerStickersQuery = gql(`
  query ViewerStickers($offset: Int!, $limit: Int!) {
    viewer {
      stickers(offset: $offset, limit: $limit) {
        ...PartialStickerFields
      }
    }
  }
`)
