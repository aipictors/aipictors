import { useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { graphql } from "gql.tada"
import React, { Suspense, useContext } from "react"
import { MyCollectionGridSkeleton } from "~/routes/($lang).my._index/components/my-collection-card"
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

  const onSort = (
    orderBy: IntrospectionEnum<"AlbumOrderBy">,
    sort: SortType,
  ) => {
    setAlbumPage(0)
    setAlbumOrderby(orderBy)
    setAlbumOrderDeskAsc(sort)
  }

  return (
    <>
      <AlbumsSetting
        sort={albumOrderDeskAsc}
        orderBy={AlbumOrderby}
        rating={albumRating}
        onSort={onSort}
        setRating={(rating) => {
          setAlbumPage(0)
          setAlbumRating(rating)
        }}
      />
      <Suspense fallback={<MyCollectionGridSkeleton />}>
        <AlbumsListContainer
          page={albumPage}
          sort={albumOrderDeskAsc}
          orderBy={AlbumOrderby}
          albumsMaxCount={albumsMaxCount}
          rating={albumRating}
          setAlbumPage={setAlbumPage}
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
