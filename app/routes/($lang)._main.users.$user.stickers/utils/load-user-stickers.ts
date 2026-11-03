import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import { StickerListItemFragment } from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import {
  readStickerListParams,
  STICKER_SORTS,
  STICKERS_PER_PAGE,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-list-params"

/**
 * ユーザーが公開しているスタンプを、URL の並び順とページで読む（全年齢・R18 共通）
 */
export const loadUserStickers = async (userId: string, request: Request) => {
  const { sort, page } = readStickerListParams(request)

  const where = { creatorUserId: userId }

  const [stickersResp, stickersCountResp] = await Promise.all([
    loaderClient.query({
      query: userStickersQuery,
      variables: {
        offset: page * STICKERS_PER_PAGE,
        limit: STICKERS_PER_PAGE,
        where: { ...STICKER_SORTS[sort].where, ...where },
      },
    }),
    loaderClient.query({
      query: userStickersCountQuery,
      variables: { where },
    }),
  ])

  return {
    sort,
    page,
    stickers: stickersResp.data.stickers,
    stickersCount: stickersCountResp.data.stickersCount,
  }
}

const userStickersQuery = graphql(
  `query UserPublicStickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...StickerListItem
    }
  }`,
  [StickerListItemFragment],
)

const userStickersCountQuery = graphql(
  `query UserPublicStickersCount($where: StickersWhereInput) {
    stickersCount(where: $where)
  }`,
)
