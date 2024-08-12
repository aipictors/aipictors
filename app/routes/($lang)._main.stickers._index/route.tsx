import { partialStickerFieldsFragment } from "~/graphql/fragments/partial-sticker-fields"
import { createClient } from "~/lib/client"
import { StickerList } from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { StickerListHeader } from "~/routes/($lang)._main.stickers._index/components/sticker-list-header"
import { StickerSearchForm } from "~/routes/($lang)._main.stickers._index/components/sticker-search-form"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"

export const meta: MetaFunction = () => {
  return [
    { title: "AIイラストスタンプ広場" },
    {
      description:
        "作ったスタンプを公開したり、みんなの作ったスタンプをダウンロードして使ってみましょう！",
    },
  ]
}

export async function loader() {
  const client = createClient()

  const stickersResp = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 40,
      where: {},
    },
  })

  const favoritedStickersResp = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 40,
      where: {
        orderBy: "DATE_DOWNLOADED",
        sort: "DESC",
      },
    },
  })

  const usedStickersResp = await client.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 40,
      where: {
        orderBy: "DATE_USED",
        sort: "DESC",
      },
    },
  })

  return json(
    {
      stickers: stickersResp.data.stickers,
      favoritedStickers: favoritedStickersResp.data.stickers,
      usedStickers: usedStickersResp.data.stickers,
    },
    {
      headers: {
        "Cache-Control": config.cacheControl.oneDay,
      },
    },
  )
}

export default function StickersPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <main className="flex flex-col space-y-8 pb-16">
      <StickerListHeader />
      <StickerSearchForm />
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{"新着"}</h2>
        <StickerList stickers={data.stickers} />
      </section>
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{"人気"}</h2>
        <StickerList stickers={data.favoritedStickers} />
      </section>
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{"使用順"}</h2>
        <StickerList stickers={data.usedStickers} />
      </section>
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
