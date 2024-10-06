import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import {
  StickerList,
  StickerListItemFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { StickerListHeader } from "~/routes/($lang)._main.stickers._index/components/sticker-list-header"
import { StickerSearchForm } from "~/routes/($lang)._main.stickers._index/components/sticker-search-form"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "react-router"
import { useLoaderData } from "react-router"
import { graphql } from "gql.tada"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.search === undefined) {
    throw new Response(null, { status: 404 })
  }

  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  const stickers = await loaderClient.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 256,
      where: {
        search: decodeURIComponent(props.params.search),
      },
    },
  })

  const isEmpty = stickers.data.stickers.length === 0

  return json({
    stickers: stickers.data.stickers,
    isEmpty,
    search: props.params.search,
  })
}

/**
 * スタンプの検索画面
 */
export default function Stickers() {
  const params = useParams()

  if (params.search === undefined) {
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  return (
    <main className="flex flex-col space-y-8 pb-16">
      <StickerListHeader title={data.search} />
      <StickerSearchForm text={decodeURIComponent(data.search)} />
      {data.isEmpty ? (
        <p>{"スタンプが見つかりませんでした"}</p>
      ) : (
        <StickerList stickers={data.stickers} />
      )}
    </main>
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
