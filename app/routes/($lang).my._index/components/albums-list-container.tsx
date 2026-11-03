import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  AlbumListItemFragment,
  AlbumsList,
} from "~/routes/($lang).my._index/components/albums-list"
import { WorksSeriesAddButton } from "~/routes/($lang).my._index/components/works-series-add-button"
import type { SortType } from "~/types/sort-type"

type Props = {
  page: number
  sort: SortType
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  albumsMaxCount: number
  rating: IntrospectionEnum<"AlbumRating"> | null
  setAlbumPage: (page: number) => void
}

/**
 * シリーズ一覧コンテナ
 */
export function AlbumsListContainer(props: Props) {
  const authContext = useContext(AuthContext)
  const isManualOrder = props.orderBy === "MANUAL"

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }
  const { data: albumsResp, refetch } = useSuspenseQuery(viewerAlbumsQuery, {
    skip:
      authContext.isLoading || authContext.isNotLoggedIn || !authContext.userId,
    variables: {
      offset: isManualOrder ? 0 : 16 * props.page,
      limit: isManualOrder ? Math.max(props.albumsMaxCount, 16) : 16,
      where: {
        orderBy: props.orderBy,
        sort: props.sort,
        ...(props.rating !== null && { ratings: [props.rating] }),
      },
    },
  })

  const albums = albumsResp?.viewer?.albums ?? []

  const refetchAlbums = () => {
    refetch()
  }

  return (
    <>
      {albums.length === 0 && props.page === 0 && props.rating === null ? (
        <WorksSeriesAddButton refetch={refetchAlbums} isEmpty />
      ) : (
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm tabular-nums">
            {`${props.albumsMaxCount.toLocaleString()}件のシリーズ`}
          </p>
          <WorksSeriesAddButton refetch={refetchAlbums} />
        </div>
      )}
      {albums.length > 0 && (
        <AlbumsList
          albums={albums}
          refetch={refetchAlbums}
          orderBy={props.orderBy}
        />
      )}
      {albums.length === 0 && props.rating !== null && (
        <p className="rounded-xl border border-dashed px-6 py-14 text-center text-muted-foreground text-sm">
          この年齢制限のシリーズはありません
        </p>
      )}
      {!isManualOrder && props.albumsMaxCount > 16 && (
        <div className="sticky bottom-0 z-10 mt-3 flex justify-center border-t bg-background/95 py-2 backdrop-blur">
          <ResponsivePagination
            perPage={16}
            maxCount={props.albumsMaxCount}
            currentPage={props.page}
            onPageChange={(page: number) => {
              props.setAlbumPage(page)
              window.scrollTo({ top: 0 })
            }}
          />
        </div>
      )}
    </>
  )
}

const viewerAlbumsQuery = graphql(
  `query ViewerAlbums($offset: Int!, $limit: Int!, $where: ViewerAlbumsWhereInput) {
    viewer {
      albums(offset: $offset, limit: $limit, where: $where) {
        ...AlbumListItem
      }
    }
  }`,
  [AlbumListItemFragment],
)
