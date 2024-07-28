import { AppLoadingPage } from "@/components/app/app-loading-page"
import { AuthContext } from "@/contexts/auth-context"
import type { IntrospectionEnum } from "@/lib/introspection-enum"
import type { SortType } from "@/types/sort-type"
import { AlbumsListContainer } from "@/routes/($lang).my._index/components/albums-list-container"
import { AlbumsSetting } from "@/routes/($lang).my._index/components/albums-settings"
import { useQuery } from "@apollo/client/index"
import type { HeadersFunction, MetaFunction } from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React, { useContext } from "react"
import { Suspense } from "react"

export const headers: HeadersFunction = () => {
  return {
    "Cache-Control": "max-age=0, s-maxage=0",
  }
}

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors - ダッシュボード - シリーズ"

  const metaDescription = "ダッシュボード - シリーズ"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "robots", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export default function MyAlbums() {
  const authContext = useContext(AuthContext)

  const [albumPage, setAlbumPage] = React.useState(0)

  const [albumOrderDeskAsc, setAlbumOrderDeskAsc] =
    React.useState<SortType>("DESC")

  const [AlbumOrderby, setAlbumOrderby] =
    React.useState<IntrospectionEnum<"AlbumOrderBy">>("DATE_CREATED")

  const [albumRating, setAlbumRating] =
    React.useState<IntrospectionEnum<"AlbumRating"> | null>(null)

  const { data: albumsCountResp, refetch: albumsCountRefetch } = useQuery(
    albumsCountQuery,
    {
      skip: authContext.isLoading || authContext.isNotLoggedIn,
      variables: {
        where: {
          ownerUserId: authContext.userId,
          isSensitiveAndAllRating: albumRating === null,
          isSensitive: albumRating !== "G",
          needInspected: false,
          needsThumbnailImage: false,
        },
      },
    },
  )

  const albumsMaxCount = albumsCountResp?.albumsCount ?? 0
  // アルバム一覧のソートボタンクリック時の処理
  const onClickAlbumTitleSortButton = () => {
    setAlbumOrderby("NAME")
    setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }
  const onClickAlbumDateSortButton = () => {
    setAlbumOrderby("DATE_CREATED")
    setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
  }

  return (
    <>
      <AlbumsSetting
        sort={albumOrderDeskAsc}
        orderBy={AlbumOrderby}
        sumAlbumsCount={albumsMaxCount}
        rating={albumRating}
        onClickAlbumTitleSortButton={onClickAlbumTitleSortButton}
        onClickAlbumDateSortButton={onClickAlbumDateSortButton}
        setRating={setAlbumRating}
        setSort={setAlbumOrderDeskAsc}
      />
      <Suspense fallback={<AppLoadingPage />}>
        <AlbumsListContainer
          page={albumPage}
          sort={albumOrderDeskAsc}
          orderBy={AlbumOrderby}
          rating={albumRating}
          albumsMaxCount={albumsMaxCount}
          setAlbumPage={setAlbumPage}
          onClickAlbumTitleSortButton={onClickAlbumTitleSortButton}
          onClickAlbumDateSortButton={onClickAlbumDateSortButton}
        />
      </Suspense>
    </>
  )
}

const albumsCountQuery = graphql(
  `query AlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }`,
)
