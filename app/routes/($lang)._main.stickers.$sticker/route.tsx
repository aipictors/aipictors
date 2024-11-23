import {
  StickerArticle,
  StickerArticleFragment,
} from "~/routes/($lang)._main.stickers.$sticker/components/sticker-article"
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { loaderClient } from "~/lib/loader-client"
import { useLoaderData } from "react-router";
import { graphql } from "gql.tada"
import {
  StickerList,
  StickerListItemFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { useTranslation } from "~/hooks/use-translation"
import { config } from "~/config"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.sticker === undefined) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const stickerResp = await loaderClient.query({
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

  const favoritedStickersResp = await loaderClient.query({
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

  return {
    sticker: stickerResp.data.sticker,
    stickers: favoritedStickersResp.data.stickers,
    headers: {
      "Cache-Control": config.cacheControl.oneDay,
    },
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

/**
 * スタンプの詳細
 */
export default function Sticker() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  if (data === null) {
    return null
  }

  return (
    <>
      <StickerArticle sticker={data.sticker} />
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{t("人気", "Popular")}</h2>
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
