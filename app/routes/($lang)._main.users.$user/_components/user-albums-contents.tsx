import { ResponsiveAlbumsList } from "@/_components/responsive-albums-list"
import { ResponsivePagination } from "@/_components/responsive-pagination"
import { AuthContext } from "@/_contexts/auth-context"
import { albumsQuery } from "@/_graphql/queries/album/albums"
import { albumsCountQuery } from "@/_graphql/queries/album/albums-count"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { SortType } from "@/_types/sort-type"
import { WorksSeriesAddButton } from "@/routes/($lang).dashboard._index/_components/works-series-add-button"
import { useSuspenseQuery } from "@apollo/client/index"
import { useContext } from "react"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  rating: IntrospectionEnum<"AlbumRating"> | null
  sort: SortType
}

export const UserAlbumsContents = (props: Props) => {
  const authContext = useContext(AuthContext)

  const { data: albumsResp, refetch } = useSuspenseQuery(albumsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        ownerUserId: props.userId,
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

  const albumsCountResp = useSuspenseQuery(albumsCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        ownerUserId: props.userId,
        isSensitiveAndAllRating: props.rating === null,
        isSensitive: props.rating !== "G",
        needInspected: false,
        needsThumbnailImage: false,
        orderBy: props.orderBy,
        sort: props.sort,
      },
    },
  })

  const albumsCount = albumsCountResp.data?.albumsCount ?? 0

  return (
    <>
      {authContext.userId === props.userId && (
        <WorksSeriesAddButton refetch={refetch} />
      )}
      <ResponsiveAlbumsList albums={albums} />
      <div className="mt-1 mb-1">
        <ResponsivePagination
          perPage={32}
          maxCount={albumsCount}
          currentPage={props.page}
          onPageChange={(page: number) => {
            props.setPage(page)
          }}
        />
      </div>
    </>
  )
}
