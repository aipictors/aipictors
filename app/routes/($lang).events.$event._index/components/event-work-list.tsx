import { useQuery } from "@apollo/client/index"
import { useNavigate } from "react-router";
import { graphql, type FragmentOf } from "gql.tada"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { EventWorksListSortableSetting } from "~/routes/($lang).events.$event._index/components/event-works-list-sortable-setting"
import type { SortType } from "~/types/sort-type"

type Props = {
  works: FragmentOf<typeof EventWorkListItemFragment>[]
  maxCount: number
  page: number
  slug: string
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  sumWorksCount: number
  setWorkType: (workType: IntrospectionEnum<"WorkType"> | null) => void
  setRating: (rating: IntrospectionEnum<"Rating"> | null) => void
  setSort: (sort: SortType) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickAccessTypeSortButton: () => void
  onClickDateSortButton: () => void
  onClickWorkTypeSortButton: () => void
  onClickIsPromotionSortButton: () => void
}

/**
 * イベント作品一覧
 */
export function EventWorkList(props: Props) {
  const navigate = useNavigate()

  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(query, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 64,
      limit: 64,
      where: {
        ratings: ["G", "R15"],
        orderBy: props.orderBy,
        sort: props.sort,
      },
      slug: props.slug,
    },
  })

  const works = resp?.appEvent?.works ?? props.works

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

  return (
    <>
      <div className="mr-auto w-32">
        <EventWorksListSortableSetting
          nowSort={props.sort}
          nowOrderBy={props.orderBy}
          allOrderBy={allSortType}
          setSort={props.setSort}
          onClickTitleSortButton={props.onClickTitleSortButton}
          onClickLikeSortButton={props.onClickLikeSortButton}
          onClickBookmarkSortButton={props.onClickBookmarkSortButton}
          onClickCommentSortButton={props.onClickCommentSortButton}
          onClickViewSortButton={props.onClickViewSortButton}
          onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
          onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
          onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
        />
      </div>
      <ResponsivePhotoWorksAlbum works={works} isShowProfile={true} />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <ResponsivePagination
          maxCount={Number(props.maxCount)}
          perPage={64}
          currentPage={props.page}
          onPageChange={(page: number) => {
            navigate(`/events/${props.slug}?page=${page}`)
          }}
        />
      </div>
    </>
  )
}

export const EventWorkListItemFragment = graphql(
  `fragment EventWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

const query = graphql(
  `query AppEvent($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
      appEvent(slug: $slug) {
        works(offset: $offset, limit: $limit, where: $where) {
          ...EventWorkListItem
        }
      }
    }`,
  [EventWorkListItemFragment],
)
