import { loaderClient } from "~/lib/loader-client"
import {
  StickerList,
  StickerListItemFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { StickerListHeader } from "~/routes/($lang)._main.stickers._index/components/sticker-list-header"
import { StickerSearchForm } from "~/routes/($lang)._main.stickers._index/components/sticker-search-form"
import { StickerCreator } from "~/routes/($lang)._main.stickers._index/components/sticker-creator"
import type {
  MetaFunction,
  LoaderFunctionArgs,
  HeadersFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { createMeta } from "~/utils/create-meta"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { useQuery } from "@apollo/client/index"

export const meta: MetaFunction = (props) => {
  return createMeta(META.STICKERS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const stickersResp = await loaderClient.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: 40,
      where: {},
    },
  })

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

  const usedStickersResp = await loaderClient.query({
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

  return {
    stickers: stickersResp.data.stickers,
    favoritedStickers: favoritedStickersResp.data.stickers,
    usedStickers: usedStickersResp.data.stickers,
    headers: {
      "Cache-Control": config.cacheControl.oneDay,
    },
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function StickersPage() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const appContext = useContext(AuthContext)

  const { data: stickers } = useQuery(stickersQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: 40,
      where: {},
    },
  })

  if (data === null) {
    return null
  }

  const newStickers = data.stickers ?? stickers?.stickers

  return (
    <main className="flex flex-col space-y-4">
      <StickerListHeader />
      <StickerCreator />
      <StickerSearchForm />
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{t("新着", "New Arrivals")}</h2>
        <StickerList stickers={newStickers} />
      </section>
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{t("人気", "Popular")}</h2>
        <StickerList stickers={data.favoritedStickers} />
      </section>
      <section className="flex flex-col gap-y-4">
        <h2 className="font-bold text-lg">{t("使用順", "Recently Used")}</h2>
        <StickerList stickers={data.usedStickers} />
      </section>
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
