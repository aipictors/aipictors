import { loaderClient } from "~/lib/loader-client"
import { AlbumArticleEditorDialogFragment } from "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-editor-dialog"
import {
  AlbumArticleHeader,
  AlbumArticleHeaderFragment,
} from "~/routes/($lang)._main.$user.albums.$album._index/components/album-article-header"
import {
  AlbumWorkList,
  AlbumWorkListItemFragment,
} from "~/routes/($lang)._main.$user.albums.$album._index/components/album-work-list"
import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import type { MetaFunction } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { useEffect, useState } from "react"
import type { SortType } from "~/types/sort-type"
import { createMeta } from "~/utils/create-meta"
import { config, META } from "~/config"

type AlbumWorkOrderParam = "DATE_CREATED" | "LIKES_COUNT" | "MANUAL"

const toAlbumWorkOrder = (value: string | null): AlbumWorkOrderParam => {
  if (
    value === "DATE_CREATED" ||
    value === "LIKES_COUNT" ||
    value === "MANUAL"
  ) {
    return value
  }

  return "MANUAL"
}

const toSort = (value: string | null): SortType => {
  return value === "ASC" ? "ASC" : "DESC"
}

export async function loader(props: LoaderFunctionArgs) {
  if (!props.params.album || !props.params.user) {
    throw new Response(null, { status: 404 })
  }

  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  const url = new URL(props.request.url)

  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0
  const orderBy = toAlbumWorkOrder(url.searchParams.get("orderBy"))
  const sort = toSort(url.searchParams.get("sort"))

  const result = await loaderClient.query({
    query: LoaderQuery,
    variables: {
      where: {
        albumSlug: props.params.album,
        ownerLoginUserId: props.params.user,
      },
      offset: 0,
      limit: 16,
      orderBy,
      sort,
    },
  })

  if (!result.data.album) {
    throw new Response(null, { status: 404 })
  }

  return {
    ...result.data,
    album: result.data.album,
    page,
  }
}

export const meta: MetaFunction = (props) => {
  if (!props.data) {
    return [{ title: "シリーズ" }]
  }

  const data = props.data as {
    album: FragmentOf<typeof AlbumWorkListItemFragment>
  }

  const album = data.album

  const worksCountPart = ""

  return createMeta(
    META.ALBUMS,
    {
      title: `${album.title}${worksCountPart}` || "シリーズ詳細",
      enTitle: `${album.title}'s page${worksCountPart}`,
      description: album.description || "AI作品のシリーズ一覧を閲覧できます",
      enDescription:
        "This is the series page on Aipictors, where you can view a list of AI illustrations and other works.",
    },
    props.params.lang,
  )
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneWeek,
})

/**
 * シリーズの詳細
 */
export default function albums () {
  const data = useLoaderData<typeof loader>()
  const [album, setAlbum] = useState(data.album)
  const [refreshKey, setRefreshKey] = useState(0)

  if (data === null) {
    return null
  }

  useEffect(() => {
    setAlbum(data.album)
    setRefreshKey(0)
  }, [data.album])

  return (
    <>
      <article className="flex flex-col md:flex-row">
        <div className="flex w-full flex-col">
          <AlbumArticleHeader
            album={album}
            onUpdatedAlbum={(nextAlbum) => {
              setAlbum((currentAlbum) => ({
                ...currentAlbum,
                ...nextAlbum,
              }))
              setRefreshKey((prev) => prev + 1)
            }}
          />
          <AlbumWorkList
            key={refreshKey}
            albumWorks={album.works}
            maxCount={album.worksCount}
            albumId={album.id}
            page={data.page}
            refreshKey={refreshKey}
          />
        </div>
      </article>
    </>
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
      ...AlbumArticleEditorDialog
    }
  }`,
  [
    AlbumArticleHeaderFragment,
    AlbumWorkListItemFragment,
    AlbumArticleEditorDialogFragment,
  ],
)
