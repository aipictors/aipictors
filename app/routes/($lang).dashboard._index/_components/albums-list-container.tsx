import type { SortType } from "@/_types/sort-type"
import type {
  AlbumOrderBy,
  AlbumRating,
} from "@/_graphql/__generated__/graphql"
import { AuthContext } from "@/_contexts/auth-context"
import { useContext } from "react"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { toDateTimeText } from "@/_utils/to-date-time-text"
import { albumsQuery } from "@/_graphql/queries/album/albums"
import { useSuspenseQuery } from "@apollo/client/index"
import { AlbumsList } from "@/routes/($lang).dashboard._index/_components/albums-list"
import { WorksSeriesAddButton } from "@/routes/($lang).dashboard._index/_components/works-series-add-button"

type Props = {
  page: number
  sort: SortType
  orderBy: AlbumOrderBy
  albumsMaxCount: number
  rating: AlbumRating | null
  setAlbumPage: (page: number) => void
  onClickAlbumTitleSortButton: () => void
  onClickAlbumDateSortButton: () => void
}

/**
 * シリーズ一覧コンテナ
 */
export const AlbumsListContainer = (props: Props) => {
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
        albums={
          albums?.map((album) => ({
            id: album.id,
            userId: album.userId,
            title: album.title,
            slug: album.slug ?? "",
            thumbnailImageUrl: album.thumbnailImageURL
              ? album.thumbnailImageURL
              : album.works?.[0]?.smallThumbnailImageURL ?? "",
            createdAt: toDateTimeText(album.createdAt),
          })) ?? []
        }
        sort={props.sort}
        orderBy={props.orderBy}
        onClickTitleSortButton={props.onClickAlbumTitleSortButton}
        onClickDateSortButton={props.onClickAlbumDateSortButton}
      />
      <div className="mt-4 mb-8">
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
