import { useQuery } from "@apollo/client/index"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import {
  type MetaFunction,
  type ShouldRevalidateFunction,
  useLoaderData,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import {
  ALBUM_WORKS_PER_PAGE,
  isAdultAlbum,
  toAlbumJsonLd,
  toAlbumMetaText,
  toAlbumPageIndex,
  toAlbumShareImageUrl,
  toAlbumWorkOrder,
  toAlbumWorkSort,
} from "~/routes/($lang)._main.$user.albums.$album._index/album-page-utils"
import {
  AlbumArticleHeader,
  AlbumArticleHeaderFragment,
} from "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-header"
import { AlbumOwnerSeries } from "~/routes/($lang)._main.$user.albums.$album._index/components/album-owner-series"
import {
  AlbumWorkList,
  AlbumWorkListItemFragment,
} from "~/routes/($lang)._main.$user.albums.$album._index/components/album-work-list"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  if (!props.params.album || !props.params.user) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

  const page = toAlbumPageIndex(url.searchParams.get("page"))
  const orderBy = toAlbumWorkOrder(url.searchParams.get("orderBy"))
  const sort = toAlbumWorkSort(url.searchParams.get("sort"))

  const result = await loaderClient.query({
    query: LoaderQuery,
    variables: {
      where: {
        albumSlug: props.params.album,
        ownerLoginUserId: props.params.user,
      },
      offset: ALBUM_WORKS_PER_PAGE * page,
      limit: ALBUM_WORKS_PER_PAGE,
      orderBy,
      sort,
    },
  })

  if (!result.data.album) {
    throw new Response(null, { status: 404 })
  }

  return {
    album: result.data.album,
    page,
    orderBy,
    sort,
  }
}

export const meta: MetaFunction<typeof loader> = (props) => {
  if (!props.data) {
    return [{ title: "シリーズ" }]
  }

  const album = props.data.album

  const metaTags = createMeta(
    {
      ...META.ALBUMS,
      // 作品のないシリーズと R18G のシリーズは検索結果に出さない
      isIndex: album.worksCount > 0 && album.rating !== "R18G",
    },
    {
      ...toAlbumMetaText(album, props.data.page),
      url: toAlbumShareImageUrl(album) ?? config.defaultOgpImageUrl,
    },
    props.params.lang,
  )

  // 成人向けのシリーズはセーフサーチで正しく扱われるようにする
  return isAdultAlbum(album)
    ? [...metaTags, { name: "rating", content: "adult" }]
    : metaTags
}

export const headers: HeadersFunction = () => ({
  // 作品の一覧をサーバーの HTML に入れるので、追加した作品がすぐ出るよう短めにする
  "Cache-Control": config.cacheControl.oneHour,
})

/**
 * 表示の切り替え（?view=）では読み直さない
 */
export const shouldRevalidate: ShouldRevalidateFunction = (props) => {
  const toKey = (url: URL) =>
    [
      url.pathname,
      url.searchParams.get("page"),
      url.searchParams.get("orderBy"),
      url.searchParams.get("sort"),
    ].join("|")

  if (!props.formMethod && toKey(props.currentUrl) === toKey(props.nextUrl)) {
    return false
  }

  return props.defaultShouldRevalidate
}

/**
 * シリーズの詳細
 */
export default function AlbumPage() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()
  const authContext = useContext(AuthContext)

  // サーバーの HTML は未ログインの内容なので、ログイン中はいいねやフォローの状態を読み直す
  const { data: viewerData, refetch } = useQuery(ViewerAlbumQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      albumId: data.album.id,
      offset: ALBUM_WORKS_PER_PAGE * data.page,
      limit: ALBUM_WORKS_PER_PAGE,
      orderBy: data.orderBy,
      sort: data.sort,
    },
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
  })

  const album = viewerData?.album ?? data.album

  const jsonLd = toAlbumJsonLd({
    album: data.album,
    works: data.album.works,
    siteUrl: config.siteURL,
    lang: t("ja", "en"),
    labels: { series: t("シリーズ", "Series") },
  })

  return (
    <article className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 pb-10 md:gap-8">
      <AppJsonLdScript jsonLd={jsonLd} />
      <AlbumArticleHeader album={album} onUpdatedAlbum={() => refetch()} />
      <AlbumWorkList
        works={album.works}
        maxCount={album.worksCount}
        page={data.page}
        orderBy={data.orderBy}
        sort={data.sort}
        isAdultSeries={isAdultAlbum(album)}
      />
      <AlbumOwnerSeries
        albumId={album.id}
        ownerUserId={album.user.id}
        ownerLogin={album.user.login}
        ownerName={album.user.name}
        isAdultSeries={isAdultAlbum(album)}
      />
    </article>
  )
}

const LoaderQuery = graphql(
  `query AlbumWorks($where: AlbumWhereInput!, $offset: Int!, $limit: Int!, $orderBy: AlbumWorkOrderBy, $sort: Sort) {
    album(where: $where) {
      id
      works(offset: $offset, limit: $limit, orderBy: $orderBy, sort: $sort) {
        ...AlbumWorkListItem
      }
      ...AlbumArticleHeader
    }
  }`,
  [AlbumArticleHeaderFragment, AlbumWorkListItemFragment],
)

const ViewerAlbumQuery = graphql(
  `query ViewerAlbumWorks($albumId: ID!, $offset: Int!, $limit: Int!, $orderBy: AlbumWorkOrderBy, $sort: Sort) {
    album(id: $albumId) {
      id
      works(offset: $offset, limit: $limit, orderBy: $orderBy, sort: $sort) {
        ...AlbumWorkListItem
      }
      ...AlbumArticleHeader
    }
  }`,
  [AlbumArticleHeaderFragment, AlbumWorkListItemFragment],
)
