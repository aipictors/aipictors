import { ParamsError } from "@/_errors/params-error"
import { partialStickerFieldsFragment } from "@/_graphql/fragments/partial-sticker-fields"
import { createClient } from "@/_lib/client"
import { StickerList } from "@/routes/($lang)._main.stickers._index/_components/sticker-list"
import { StickerListHeader } from "@/routes/($lang)._main.stickers._index/_components/sticker-list-header"
import { StickerSearchForm } from "@/routes/($lang)._main.stickers._index/_components/sticker-search-form"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.search === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const stickers = await client.query({
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
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <main className="flex flex-col space-y-8 pb-16">
      <StickerListHeader />
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
      ...PartialStickerFields
    }
  }`,
  [partialStickerFieldsFragment],
)
