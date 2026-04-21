import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React, { Suspense, useContext } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { AlbumsListContainer } from "~/routes/($lang).my._index/components/albums-list-container"
import { AlbumsSetting } from "~/routes/($lang).my._index/components/albums-settings"
import type { SortType } from "~/types/sort-type"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_ALBUMS, undefined, props.params.lang)
}

export async function loader(_props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  return {}
}

export const headers: HeadersFunction = () => ({
  // キャッシュ不要
  // "Cache-Control": config.cacheControl.oneHour,
})

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
          ...(albumRating !== null && { ratings: [albumRating] }),
          needInspected: false,
          needsThumbnailImage: false,
        },
      },
    },
  )

  const albumsMaxCount = albumsCountResp?.albumsCount ?? 0

  // アルバム一覧のソートボタンクリック時の処理
  const onClickAlbumTitleSortButton = () => {
    setAlbumPage(0)
    if (AlbumOrderby === "NAME") {
      setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
      return
    }

    setAlbumOrderby("NAME")
    setAlbumOrderDeskAsc("DESC")
  }

  const onClickAlbumDateSortButton = () => {
    setAlbumPage(0)
    if (AlbumOrderby === "DATE_CREATED") {
      setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
      return
    }

    setAlbumOrderby("DATE_CREATED")
    setAlbumOrderDeskAsc("DESC")
  }

  const onClickAlbumUpdatedSortButton = () => {
    setAlbumPage(0)
    if (AlbumOrderby === "DATE_UPDATED") {
      setAlbumOrderDeskAsc(albumOrderDeskAsc === "ASC" ? "DESC" : "ASC")
      return
    }

    setAlbumOrderby("DATE_UPDATED")
    setAlbumOrderDeskAsc("DESC")
  }

  const onClickAlbumManualSortButton = () => {
    setAlbumOrderby("MANUAL")
    setAlbumPage(0)
    setAlbumOrderDeskAsc("DESC")
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
        onClickAlbumUpdatedSortButton={onClickAlbumUpdatedSortButton}
        onClickAlbumManualSortButton={onClickAlbumManualSortButton}
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
