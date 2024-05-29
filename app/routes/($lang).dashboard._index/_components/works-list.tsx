import type { WorkAccessType } from "@/_types/work-access-type"
import type { SortType } from "@/_types/sort-type"
import type { WorksOrderby } from "@/routes/($lang).dashboard._index/_types/works-orderby"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"
import { WorksSpList } from "@/routes/($lang).dashboard._index/_components/works-sp-list"
import { WorksListSortableSetting } from "@/routes/($lang).dashboard._index/_components/works-list-sortable-setting"
import type { WorkRatingType } from "@/_types/work-rating-type"
import { WorksListFilterSetting } from "@/routes/($lang).dashboard._index/_components/works-list-filter-setting"
import { WorksListTable } from "@/routes/($lang).dashboard._index/_components/works-list-table"
import { Badge } from "@/_components/ui/badge"

type Props = {
  works: {
    id: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: string
    accessType: WorkAccessType
    isTagEditable: boolean
  }[]
  sort: SortType
  orderBy: WorksOrderby
  accessType: WorkAccessType | null
  rating: WorkRatingType | null
  sumWorksCount: number
  setAccessType: (accessType: WorkAccessType | null) => void
  setRating: (rating: WorkRatingType | null) => void
  setSort: (sort: SortType) => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * 作品一覧
 */
export const WorksList = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const displayWorks = props.works.map((work) => {
    return {
      ...work,
      title: truncateTitle(work.title, 32),
    }
  })

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
  ] as WorksOrderby[]

  return (
    <>
      <div className="mb-4">
        {isDesktop ? (
          <>
            <div className="flex">
              <div className="mr-4 rounded-md bg-gray-100 p-1 dark:bg-gray-800">
                {"作品"}
                <Badge className="m-2 bg-gray-400 dark:bg-gray-500 dark:text-white">
                  {props.sumWorksCount}
                </Badge>
              </div>
            </div>
            <WorksListFilterSetting
              accessType={props.accessType}
              rating={props.rating}
              setAccessType={props.setAccessType}
              setRating={props.setRating}
            />
          </>
        ) : (
          <WorksListSortableSetting
            nowSort={props.sort}
            nowOrderBy={props.orderBy}
            allOrderBy={allSortType}
            setSort={props.setSort}
            onClickLikeSortButton={props.onClickLikeSortButton}
            onClickBookmarkSortButton={props.onClickBookmarkSortButton}
            onClickCommentSortButton={props.onClickCommentSortButton}
            onClickViewSortButton={props.onClickViewSortButton}
            onClickDateSortButton={props.onClickDateSortButton}
          />
        )}
      </div>
      {isDesktop ? (
        <WorksListTable
          works={displayWorks}
          sort={props.sort}
          orderBy={props.orderBy}
          onClickLikeSortButton={props.onClickLikeSortButton}
          onClickBookmarkSortButton={props.onClickBookmarkSortButton}
          onClickCommentSortButton={props.onClickCommentSortButton}
          onClickViewSortButton={props.onClickViewSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
        />
      ) : (
        <WorksSpList
          works={displayWorks}
          sort={props.sort}
          orderBy={props.orderBy}
          onClickLikeSortButton={props.onClickLikeSortButton}
          onClickBookmarkSortButton={props.onClickBookmarkSortButton}
          onClickCommentSortButton={props.onClickCommentSortButton}
          onClickViewSortButton={props.onClickViewSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
        />
      )}
    </>
  )
}
