import { AppLoadingPage } from "~/components/app/app-loading-page"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { AlbumsListContainer } from "~/routes/($lang).my._index/components/albums-list-container"
import { AlbumsSetting } from "~/routes/($lang).my._index/components/albums-settings"
import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React, { useContext } from "react"
import { Suspense } from "react"
import { createMeta } from "~/utils/create-meta"
import { META } from "~/config"

export const meta: MetaFunction = (props) => {
  return createMeta(META.MY_ALBUMS, undefined, props.params.lang)
}

export async function loader(props: LoaderFunctionArgs) {
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
