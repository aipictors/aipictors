import {
  albumItemFragment,
  albumItemWorkFragment,
  ResponsiveAlbumsList,
} from "~/components/responsive-albums-list"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { WorksSeriesAddButton } from "~/routes/($lang).my._index/components/works-series-add-button"
import { useSuspenseQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { useContext } from "react"

type Props = {
  page: number
  setPage(page: number): void
  userId: string
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  rating: IntrospectionEnum<"AlbumRating">
  sort: SortType
}

export function UserAlbumsContents(props: Props) {
  const authContext = useContext(AuthContext)

  const { data: albumsResp, refetch } = useSuspenseQuery(AlbumsQuery, {
    skip: authContext.isLoading,
    variables: {
      offset: 16 * props.page,
      limit: 16,
      where: {
        ownerUserId: props.userId,
        isSensitiveAndAllRating: props.rating === null,
        isSensitive: props.rating === "R18",
        needInspected: false,
        needsThumbnailImage: false,
        orderBy: props.orderBy,
        sort: props.sort,
      },
    },
  })

  const albums = albumsResp?.albums ?? []

  const albumsCountResp = useSuspenseQuery(AlbumsCountQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      where: {
        ownerUserId: props.userId,
        isSensitiveAndAllRating: props.rating === null,
        isSensitive: props.rating === "R18",
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
      <div className="flex flex-wrap gap-2">
        {albums
          .filter((album) => album.works.length > 0)
          .map((album) => (
            <ResponsiveAlbumsList
              key={album.id}
              album={album}
              works={album.works}
            />
          ))}
      </div>
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          perPage={16}
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

const AlbumsCountQuery = graphql(
  `query AlbumsCount($where: AlbumsWhereInput) {
    albumsCount(where: $where)
  }`,
)

const AlbumsQuery = graphql(
  `query Albums($offset: Int!, $limit: Int!, $where: AlbumsWhereInput) {
    albums(offset: $offset, limit: $limit, where: $where) {
      ...AlbumItemFields
      works(limit: $limit, offset: $offset) {
        ...AlbumItemWorkFields
      }
    }
  }`,
  [albumItemFragment, albumItemWorkFragment],
)
