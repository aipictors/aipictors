import { partialStickerFieldsFragment } from "@/_graphql/fragments/partial-sticker-fields"
import { graphql } from "gql.tada"

/**
 * ログイン中のユーザのスタンプ
 */
export const viewerUserStickersQuery = graphql(
  `query ViewerUserStickers($offset: Int!, $limit: Int!, $orderBy: StickerOrderBy, $where: UserStickersWhereInput) {
    viewer {
      userStickers(offset: $offset, limit: $limit, orderBy: $orderBy, where: $where) {
        ...PartialStickerFields
      }
    }
  }`,
  [partialStickerFieldsFragment],
)
