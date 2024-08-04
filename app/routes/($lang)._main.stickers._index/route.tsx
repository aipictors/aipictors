import { partialStickerFieldsFragment } from "~/graphql/fragments/partial-sticker-fields"
import { createClient } from "~/lib/client"
import { StickerList } from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { StickerListHeader } from "~/routes/($lang)._main.stickers._index/components/sticker-list-header"
import { StickerSearchForm } from "~/routes/($lang)._main.stickers._index/components/sticker-search-form"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

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

  return json({
    stickers: stickersResp.data.stickers,
  })
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
