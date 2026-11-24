import { useQuery } from "@apollo/client/index"
import { graphql } from "gql.tada"
import { ArrowDown, ArrowUp } from "lucide-react"
import { type ReactNode, useContext } from "react"
import {
  appPillRowClassName,
  appPillTabClassName,
} from "~/components/app/app-pill-tab"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
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
  /** ページ送りの移動先（R18 版は "/r/events"） */
  basePath?: string
  eventSource: "OFFICIAL" | "USER"
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  /** 年齢区分を指定しないときに出す区分（省略時は R18・R18G も含めたすべて） */
  defaultRatings?: IntrospectionEnum<"Rating">[]
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
  /** "chips": よく使う並び順をボタンで並べる（押し直すと昇順/降順） */
  sortVariant?: "dropdown" | "chips"
  onChangeOrderBy?: (orderBy: IntrospectionEnum<"WorkOrderBy">) => void
  /** 並び替えの右側に置く要素（モザイク切り替えなど） */
  toolbarEnd?: ReactNode
  /** チップで出す並び順（省略時は新着・いいね・ブックマーク・閲覧数・コメント） */
  chipSortTypes?: {
    orderBy: IntrospectionEnum<"WorkOrderBy">
    label: string
  }[]
}

/**
 * イベント作品一覧
 */
export function EventWorkList(props: Props) {
  const navigate = useNavigate()
  const t = useTranslation()

  const authContext = useContext(AuthContext)

  const { data: resp } = useQuery(query, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: {
      offset: props.page * 64,
      limit: 64,
      where: {
        ratings: props.rating
          ? [props.rating]
          : (props.defaultRatings ?? DEFAULT_EVENT_WORK_RATINGS),
        orderBy: props.orderBy,
        sort: props.sort,
      },
      slug: props.slug,
    },
  })

  const works =
    props.eventSource === "OFFICIAL"
      ? (resp?.appEvent?.works ?? props.works)
      : (resp?.userEvent?.works ?? props.works)

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

  const chipSortTypes: {
    orderBy: IntrospectionEnum<"WorkOrderBy">
    label: string
  }[] = props.chipSortTypes ?? [
    { orderBy: "DATE_CREATED", label: t("新着", "Newest") },
    { orderBy: "LIKES_COUNT", label: t("いいね", "Likes") },
    { orderBy: "BOOKMARKS_COUNT", label: t("ブックマーク", "Bookmarks") },
    { orderBy: "VIEWS_COUNT", label: t("閲覧数", "Views") },
    { orderBy: "COMMENTS_COUNT", label: t("コメント", "Comments") },
  ]

  return (
    <div className="space-y-5">
      {!props.isHideSortableSetting && props.sortVariant === "chips" && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className={appPillRowClassName}>
            {chipSortTypes.map((item) => {
              const isActive = props.orderBy === item.orderBy
              return (
                <button
                  key={item.orderBy}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    if (isActive) {
                      props.setSort(props.sort === "ASC" ? "DESC" : "ASC")
                      return
                    }
                    props.onChangeOrderBy?.(item.orderBy)
                  }}
                  className={cn(appPillTabClassName(isActive), "gap-1")}
                >
                  {item.label}
                  {isActive &&
                    (props.sort === "ASC" ? (
                      <ArrowUp
                        className="size-3.5"
                        aria-label={t("昇順", "Ascending")}
                      />
                    ) : (
                      <ArrowDown
                        className="size-3.5"
                        aria-label={t("降順", "Descending")}
                      />
                    ))}
                </button>
              )
            })}
          </div>
          {props.toolbarEnd}
        </div>
      )}
      {!props.isHideSortableSetting && props.sortVariant !== "chips" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium text-foreground/75 text-xs uppercase tracking-wide">
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
      {/* 1 ページに収まるときは出さない（下に固定すると作品に重なっていた） */}
      {Number(props.maxCount) > 64 && (
        <div className="pt-2">
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

              // チップ表示のページでは作品一覧の先頭に戻す（ヘッダー画像まで戻らない）
              const hash = props.sortVariant === "chips" ? "#event-works" : ""
              navigate(
                `${props.basePath ?? "/events"}/${props.slug}?${params.toString()}${hash}`,
              )
            }}
          />
        </div>
      )}
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
