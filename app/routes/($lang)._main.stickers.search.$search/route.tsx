import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"
import { ParamsError } from "~/errors/params-error"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { StickerListItemFragment } from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { StickerListHeader } from "~/routes/($lang)._main.stickers._index/components/sticker-list-header"
import { StickerListSection } from "~/routes/($lang)._main.stickers._index/components/sticker-list-section"
import { StickerSearchForm } from "~/routes/($lang)._main.stickers._index/components/sticker-search-form"
import {
  readStickerListParams,
  STICKER_SORTS,
  STICKERS_PER_PAGE,
} from "~/routes/($lang)._main.stickers._index/utils/sticker-list-params"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.search === undefined) {
    throw new Response(null, { status: 404 })
  }

  const { sort, page } = readStickerListParams(props.request)

  const search = decodeURIComponent(props.params.search)

  const [stickersResp, stickersCountResp] = await Promise.all([
    loaderClient.query({
      query: stickersQuery,
      variables: {
        offset: page * STICKERS_PER_PAGE,
        limit: STICKERS_PER_PAGE,
        where: { ...STICKER_SORTS[sort].where, search },
      },
    }),
    loaderClient.query({
      query: stickersCountQuery,
      variables: { where: { search } },
    }),
  ])

  return {
    sort,
    page,
    stickers: stickersResp.data.stickers,
    stickersCount: stickersCountResp.data.stickersCount,
    search,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * スタンプの検索画面
 */
export default function Stickers() {
  const params = useParams()

  if (params.search === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  return (
    <div className="flex flex-col gap-5 pb-16">
      <StickerListHeader title={data.search} />
      <StickerSearchForm key={data.search} text={data.search} />
      <StickerListSection
        stickers={data.stickers}
        count={data.stickersCount}
        sort={data.sort}
        page={data.page}
        emptyMessage={t(
          "スタンプが見つかりませんでした",
          "No stickers were found",
        )}
      />
    </div>
  )
}

const stickersQuery = graphql(
  `query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...StickerListItem
    }
  }`,
  [StickerListItemFragment],
)

const stickersCountQuery = graphql(
  `query StickersCount($where: StickersWhereInput) {
    stickersCount(where: $where)
  }`,
)
