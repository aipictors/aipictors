import {
  StickerArticle,
  StickerArticleFragment,
} from "~/routes/($lang)._main.stickers.$sticker/components/sticker-article"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { loaderClient } from "~/lib/loader-client"
import { useLoaderData } from "@remix-run/react"
import { Link } from "~/lib/app/locale-router"
import { graphql } from "gql.tada"
import type { BreadcrumbList, ImageObject, WithContext } from "schema-dts"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import {
  StickerList,
  StickerListItemFragment,
} from "~/routes/($lang)._main.stickers._index/components/sticker-list"
import { useTranslation } from "~/hooks/use-translation"
import { config, META } from "~/config"
import { createMeta } from "~/utils/create-meta"

const RELATED_STICKERS_COUNT = 14

const SITE_URL = "https://www.aipictors.com"

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return createMeta(META.STICKERS, undefined, props.params.lang)
  }
  const { sticker } = props.data
  return createMeta(
    META.STICKER,
    {
      title: sticker.title,
      user: sticker.user.name,
      image: sticker.imageUrl ?? "",
    },
    props.params.lang,
  )
}

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.sticker === undefined) {
    throw new Response(null, { status: 404 })
  }

  const stickerResp = await loaderClient.query({
    query: stickerQuery,
    variables: {
      id: props.params.sticker,
    },
  })

  const sticker = stickerResp.data.sticker

  if (
    sticker === null ||
    sticker === undefined ||
    sticker.accessType !== "PUBLIC"
  ) {
    throw new Response(null, { status: 404 })
  }

  const [creatorStickersResp, popularStickersResp] = await Promise.all([
    loaderClient.query({
      query: stickersQuery,
      variables: {
        offset: 0,
        limit: RELATED_STICKERS_COUNT + 1,
        where: { creatorUserId: sticker.userId },
      },
    }),
    loaderClient.query({
      query: stickersQuery,
      variables: {
        offset: 0,
        limit: RELATED_STICKERS_COUNT + 1,
        where: {
          orderBy: "DATE_DOWNLOADED",
          sort: "DESC",
        },
      },
    }),
  ])

  const excludeSelf = <T extends { id: string }>(stickers: T[]) =>
    stickers
      .filter((item) => item.id !== sticker.id)
      .slice(0, RELATED_STICKERS_COUNT)

  return {
    sticker,
    creatorStickers: excludeSelf(creatorStickersResp.data.stickers),
    stickers: excludeSelf(popularStickersResp.data.stickers),
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

/**
 * スタンプの詳細
 */
export default function Sticker () {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const { sticker } = data
  const pageUrl = `${SITE_URL}/stickers/${sticker.id}`

  const imageJsonLd: WithContext<ImageObject> = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: sticker.title,
    contentUrl: sticker.imageUrl ?? undefined,
    url: pageUrl,
    datePublished: new Date(sticker.createdAt * 1000).toISOString(),
    creator: {
      "@type": "Person",
      name: sticker.user.name,
      url: `${SITE_URL}/users/${sticker.user.login}`,
    },
  }

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
      { "@type": "ListItem", position: 3, name: sticker.title, item: pageUrl },
    ],
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <AppJsonLdScript jsonLd={[imageJsonLd, breadcrumbJsonLd]} />
      <StickerArticle sticker={sticker} />
      {data.creatorStickers.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-bold text-base">
            {t(
              `${sticker.user.name} さんのスタンプ`,
              `Stickers by ${sticker.user.name}`,
            )}
          </h2>
          <StickerList stickers={data.creatorStickers} />
        </section>
      )}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold text-base">
            {t("人気のスタンプ", "Popular stickers")}
          </h2>
          <Link
            to="/stickers?sort=popular"
            className="shrink-0 text-muted-foreground text-xs hover:text-foreground"
          >
            {t("もっと見る", "See more")}
          </Link>
        </div>
        <StickerList stickers={data.stickers} />
      </section>
    </div>
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
