import type { SortType } from "~/types/sort-type"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useSuspenseQuery } from "@apollo/client/index"
import {
  AlbumListItemFragment,
  AlbumsList,
} from "~/routes/($lang).my._index/components/albums-list"
import { WorksSeriesAddButton } from "~/routes/($lang).my._index/components/works-series-add-button"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { graphql } from "gql.tada"

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

  if (
    authContext.isLoading ||
    authContext.isNotLoggedIn ||
    authContext.userId === undefined ||
    !authContext.userId
  ) {
    return null
  }
  const { data: albumsResp, refetch } = useSuspenseQuery(albumsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        ownerUserId: authContext.userId,
        isSensitiveAndAllRating: props.rating === null,
        isSensitive: props.rating !== "G",
        needInspected: false,
        needsThumbnailImage: false,
        orderBy: props.orderBy,
        sort: props.sort,
      },
    },
  })

  const albums = albumsResp?.albums ?? []

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
        sort={props.sort}
        orderBy={props.orderBy}
        onClickTitleSortButton={props.onClickAlbumTitleSortButton}
        onClickDateSortButton={props.onClickAlbumDateSortButton}
      />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
  )
}

const albumsQuery = graphql(
  `query Albums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...AlbumListItem
    }
  }`,
  [AlbumListItemFragment],
)
