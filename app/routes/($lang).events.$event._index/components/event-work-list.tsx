import { useQuery } from "@apollo/client/index"
import { gql } from "@apollo/client/index"
import { useNavigate } from "@remix-run/react"
import { useContext } from "react"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { graphql } from "gql.tada"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { useTranslation } from "~/hooks/use-translation"
import { EventWorksListSortableSetting } from "~/routes/($lang).events.$event._index/components/event-works-list-sortable-setting"
import type { SortType } from "~/types/sort-type"

const DEFAULT_EVENT_WORK_RATINGS: IntrospectionEnum<"Rating">[] = [
  "G",
  "R15",
  "R18",
  "R18G",
]

type Props = {
  works: any[]
  maxCount: number
  page: number
  slug: string
  eventSource: "OFFICIAL" | "USER"
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  sumWorksCount: number
  isHideSortableSetting?: boolean
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
  revealSensitiveThumbnails?: boolean
}

/**
 * イベント作品一覧
 */
export function EventWorkList (props: Props) {
  const navigate = useNavigate()
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(query, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 64,
      limit: 64,
      where: {
        ratings: props.rating ? [props.rating] : DEFAULT_EVENT_WORK_RATINGS,
        orderBy: props.orderBy,
        sort: props.sort,
      },
      slug: props.slug,
    },
  })

  const works = props.eventSource === "OFFICIAL"
    ? resp?.appEvent?.works ?? props.works
    : resp?.userEvent?.works ?? props.works

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

  return (
    <div className="space-y-6">
      {!props.isHideSortableSetting && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium text-foreground/75 text-xs tracking-wide uppercase">
              {t("並び替え", "Sort")}
            </div>
            <div className="mt-1 text-foreground text-sm">
              {t("見たい順に作品を切り替え", "Change how entries are ordered")}
            </div>
          </div>
          <div className="w-full md:w-40">
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
        </div>
      )}
      <ResponsivePhotoWorksAlbum
        works={works}
        isShowProfile={true}
        shouldMaskSensitiveWorks={!props.revealSensitiveThumbnails}
      />
      <div className="h-8" />
      <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
        <ResponsivePagination
          maxCount={Number(props.maxCount)}
          perPage={64}
          currentPage={props.page}
          onPageChange={(page: number) => {
            const params = new URLSearchParams()
            params.set("page", String(page))
            params.set("WorkOrderby", props.orderBy)
            params.set("worksOrderDeskAsc", props.sort)

            if (props.workType) {
              params.set("workType", props.workType)
            }

            if (props.rating) {
              params.set("rating", props.rating)
            }

            navigate(`/events/${props.slug}?${params.toString()}`)
          }}
        />
      </div>
    </div>
  )
}

export const EventWorkListItemFragment = graphql(
  `fragment EventWorkListItem on WorkNode @_unmask {
    ...PhotoAlbumWork
  }`,
  [PhotoAlbumWorkFragment],
)

const query = graphql(
  `query AppEventWorkList($slug: String!, $offset: Int!, $limit: Int!, $where: WorksWhereInput!) {
      appEvent(slug: $slug) {
        works(offset: $offset, limit: $limit, where: $where) {
          ...EventWorkListItem
        }
      }
      userEvent(slug: $slug) {
        works(offset: $offset, limit: $limit, where: $where) {
          ...EventWorkListItem
        }
      }
    }`,
  [EventWorkListItemFragment],
)
