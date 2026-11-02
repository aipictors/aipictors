import { loaderClient } from "~/lib/loader-client"
import {
  StickerList,
  StickerListItemFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { StickerListHeader } from "~/routes/($lang)._main.stickers._index/components/sticker-list-header"
import { StickerSearchForm } from "~/routes/($lang)._main.stickers._index/components/sticker-search-form"
import type {
  MetaFunction,
  LoaderFunctionArgs,
  HeadersFunction,
} from "@remix-run/cloudflare"
import { Link, useLoaderData } from "@remix-run/react"
import { useLazyQuery } from "@apollo/client/index"
import { graphql, type ResultOf } from "gql.tada"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { Button } from "~/components/ui/button"
import { config, META } from "~/config"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { createMeta } from "~/utils/create-meta"

const PER_PAGE = 42

const SITE_URL = "https://www.aipictors.com"

const STICKER_SORTS = {
  new: {
    ja: "新着",
    en: "New",
    where: {},
  },
  popular: {
    ja: "人気",
    en: "Popular",
    where: { orderBy: "DATE_DOWNLOADED", sort: "DESC" },
  },
  used: {
    ja: "最近使われた",
    en: "Recently used",
    where: { orderBy: "DATE_USED", sort: "DESC" },
  },
} as const

type StickerSort = keyof typeof STICKER_SORTS

const toStickerSort = (value: string | null): StickerSort => {
  return value === "popular" || value === "used" ? value : "new"
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.STICKERS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
  const sort = toStickerSort(new URL(props.request.url).searchParams.get("sort"))

  const stickersResp = await loaderClient.query({
    query: stickersQuery,
    variables: {
      offset: 0,
      limit: PER_PAGE,
      where: STICKER_SORTS[sort].where,
    },
  })

  return {
    sort,
    stickers: stickersResp.data.stickers,
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

export default function StickersPage () {
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
      <section className="flex flex-col gap-4">
        <nav className="flex gap-1 border-b" aria-label={t("並び順", "Sort")}>
          {(Object.keys(STICKER_SORTS) as StickerSort[]).map((sort) => (
            <Link
              key={sort}
              to={sort === "new" ? "/stickers" : `/stickers?sort=${sort}`}
              preventScrollReset
              prefetch="intent"
              aria-current={data.sort === sort ? "page" : undefined}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 font-medium text-sm transition-colors",
                data.sort === sort
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t(STICKER_SORTS[sort].ja, STICKER_SORTS[sort].en)}
            </Link>
          ))}
        </nav>
        <h2 className="sr-only">
          {t(
            `${STICKER_SORTS[data.sort].ja}のスタンプ`,
            `${STICKER_SORTS[data.sort].en} stickers`,
          )}
        </h2>
        <StickerList stickers={data.stickers} isFirstView />
        <MoreStickers
          key={data.sort}
          sort={data.sort}
          isInitiallyFull={data.stickers.length === PER_PAGE}
          excludedIds={data.stickers.map((sticker) => sticker.id)}
        />
      </section>
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

function MoreStickers(props: {
  sort: StickerSort
  isInitiallyFull: boolean
  excludedIds: string[]
}) {
  const t = useTranslation()

  const [stickers, setStickers] = useState<
    ResultOf<typeof stickersQuery>["stickers"]
  >([])
  const [offset, setOffset] = useState(PER_PAGE)
  const [hasMore, setHasMore] = useState(props.isInitiallyFull)

  const [fetchStickers, { loading, error }] = useLazyQuery(stickersQuery, {
    fetchPolicy: "network-only",
  })

  const loadMore = async () => {
    const result = await fetchStickers({
      variables: {
        offset,
        limit: PER_PAGE,
        where: STICKER_SORTS[props.sort].where,
      },
    })
    const next = result.data?.stickers
    if (next === undefined) return
    setStickers((current) => {
      // 読み込む間に新しいスタンプが増えると、前のページと同じものが来ることがある
      const seen = new Set([
        ...props.excludedIds,
        ...current.map((sticker) => sticker.id),
      ])
      return [...current, ...next.filter((sticker) => !seen.has(sticker.id))]
    })
    setOffset((current) => current + PER_PAGE)
    setHasMore(next.length === PER_PAGE)
  }

  return (
    <>
      {stickers.length > 0 && <StickerList stickers={stickers} />}
      {error && (
        <p className="text-center text-destructive text-sm">
          {t(
            "読み込めませんでした。もう一度お試しください。",
            "Could not load. Please try again.",
          )}
        </p>
      )}
      {hasMore && (
        <Button
          variant="secondary"
          className="mx-auto h-10 min-w-48 rounded-full"
          disabled={loading}
          onClick={() => void loadMore()}
        >
          {loading && <Loader2Icon className="mr-2 size-4 animate-spin" />}
          {t("もっと見る", "Show more")}
        </Button>
      )}
    </>
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
