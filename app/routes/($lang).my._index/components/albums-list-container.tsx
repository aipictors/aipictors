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
  onClickAlbumTitleSortButton: () => void
  onClickAlbumDateSortButton: () => void
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
      <div className="mb-2">
        <WorksSeriesAddButton refetch={refetchAlbums} />
      </div>
      <AlbumsList
        albums={albums}
        refetch={refetchAlbums}
        sort={props.sort}
        orderBy={props.orderBy}
        onClickTitleSortButton={props.onClickAlbumTitleSortButton}
        onClickDateSortButton={props.onClickAlbumDateSortButton}
      />
      {!isManualOrder && (
        <>
          <div className="h-8" />
          <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
            <ResponsivePagination
              perPage={16}
              maxCount={props.albumsMaxCount}
              currentPage={props.page}
              onPageChange={(page: number) => {
                props.setAlbumPage(page)
              }}
            />
          </div>
        </>
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
