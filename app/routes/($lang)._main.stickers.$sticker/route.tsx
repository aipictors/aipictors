import {
  StickerArticle,
  StickerArticleFragment,
} from "~/routes/($lang)._main.stickers.$sticker/components/sticker-article"
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare"
import { createClient } from "~/lib/client"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import {
  StickerList,
  StickerListItemFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { config } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.sticker === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const stickerResp = await client.query({
    query: stickerQuery,
    variables: {
      id: props.params.sticker,
    },
  })

  if (
    stickerResp.data.sticker === null ||
    stickerResp.data.sticker === undefined ||
    stickerResp.data.sticker.accessType !== "PUBLIC"
  ) {
    throw new Response(null, { status: 404 })
  }

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

  return json(
    {
      sticker: stickerResp.data.sticker,
      stickers: favoritedStickersResp.data.stickers,
    },
    {
      headers: {
        "Cache-Control": config.cacheControl.oneDay,
      },
    },
  )
}

/**
 * スタンプの詳細
 */
export default function Sticker() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <StickerArticle sticker={data.sticker} />
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{"人気"}</h2>
        <StickerList stickers={data.stickers} />
      </section>
    </>
  )
}

const stickerQuery = graphql(
  `query Sticker($id: ID!) {
    sticker(id: $id) {
      ...StickerArticle
    }
  }
`,
  [StickerArticleFragment],
)

const stickersQuery = graphql(
  `query Stickers($offset: Int!, $limit: Int!, $where: StickersWhereInput) {
    stickers(offset: $offset, limit: $limit, where: $where) {
      ...StickerListItem
    }
  }`,
  [StickerListItemFragment],
)
