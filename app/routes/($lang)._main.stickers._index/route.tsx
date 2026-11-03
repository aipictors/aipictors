import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { config, META } from "~/config"
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
import { createMeta } from "~/utils/create-meta"

const SITE_URL = "https://www.aipictors.com"

export const meta: MetaFunction = (props) => {
  return createMeta(META.STICKERS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const { sort, page } = readStickerListParams(props.request)

  const [stickersResp, stickersCountResp] = await Promise.all([
    loaderClient.query({
      query: stickersQuery,
      variables: {
        offset: page * STICKERS_PER_PAGE,
        limit: STICKERS_PER_PAGE,
        where: STICKER_SORTS[sort].where,
      },
    }),
    loaderClient.query({ query: stickersCountQuery }),
  ])

  return {
    sort,
    page,
    stickers: stickersResp.data.stickers,
    stickersCount: stickersCountResp.data.stickersCount,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Aipictors", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "AIイラストスタンプ広場",
      item: `${SITE_URL}/stickers`,
    },
  ],
}

export default function StickersPage() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AIイラストスタンプ広場",
    url: `${SITE_URL}/stickers`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: data.stickers.slice(0, 20).map((sticker, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: sticker.title ?? "",
        url: `${SITE_URL}/stickers/${sticker.id}`,
      })),
    },
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <AppJsonLdScript jsonLd={[jsonLd, breadcrumbJsonLd]} />
      <StickerListHeader />
      <StickerSearchForm />
      <StickerListSection
        stickers={data.stickers}
        count={data.stickersCount}
        sort={data.sort}
        page={data.page}
        emptyMessage={t(
          "このページにスタンプはありません",
          "No stickers on this page",
        )}
      />
      <section className="space-y-3 rounded-2xl bg-muted/40 p-4 text-sm md:p-6">
        <h2 className="font-bold text-base">
          {t("スタンプの使い方", "How to use stickers")}
        </h2>
        <ol className="grid gap-3 md:grid-cols-3">
          <li>
            <p className="font-medium">
              {t("1. 気に入ったスタンプを選ぶ", "1. Pick a sticker you like")}
            </p>
            <p className="text-muted-foreground text-xs leading-5">
              {t(
                "スタンプのページで「マイスタンプに追加」を押すと、自分のスタンプになります。",
                'Press "Add to My Stickers" on its page to add it to your collection.',
              )}
            </p>
          </li>
          <li>
            <p className="font-medium">
              {t("2. コメントで使う", "2. Use it in comments")}
            </p>
            <p className="text-muted-foreground text-xs leading-5">
              {t(
                "作品のコメント欄のスタンプボタンから送れます。",
                "Send it from the sticker button in a work's comment box.",
              )}
            </p>
          </li>
          <li>
            <p className="font-medium">
              {t("3. 自分でも作ってみる", "3. Make your own")}
            </p>
            <p className="text-muted-foreground text-xs leading-5">
              {t(
                "作成ツールや手元の画像からスタンプを作って、みんなに公開できます。",
                "Make stickers with the tool or from your images and share them with everyone.",
              )}
            </p>
          </li>
        </ol>
      </section>
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
  `query StickersCount {
    stickersCount
  }`,
)
