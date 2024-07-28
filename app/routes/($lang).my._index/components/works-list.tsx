import type { SortType } from "~/types/sort-type"
import { WorksSpList } from "~/routes/($lang).my._index/components/works-sp-list"
import { WorksListTable } from "~/routes/($lang).my._index/components/works-list-table"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  works: {
    id: string
    uuid: string
    title: string
    thumbnailImageUrl: string
    likesCount: number
    bookmarksCount: number
    commentsCount: number
    viewsCount: number
    createdAt: number
    accessType: IntrospectionEnum<"AccessType">
    workType: IntrospectionEnum<"WorkType">
    isTagEditable: boolean
  }[]
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  setAccessType: (accessType: IntrospectionEnum<"AccessType"> | null) => void
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
}

/**
 * 作品一覧
 */
export const WorksList = (props: Props) => {
  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? `${title.slice(0, maxLength)}...` : title
  }

  const displayWorks = props.works.map((work) => {
    return {
      ...work,
      title: truncateTitle(work.title, 32),
    }
  })

  return (
    <>
      <div className="hidden md:block">
        <WorksListTable
          works={displayWorks}
          sort={props.sort}
          orderBy={props.orderBy}
          onClickTitleSortButton={props.onClickTitleSortButton}
          onClickLikeSortButton={props.onClickLikeSortButton}
          onClickBookmarkSortButton={props.onClickBookmarkSortButton}
          onClickCommentSortButton={props.onClickCommentSortButton}
          onClickViewSortButton={props.onClickViewSortButton}
          onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
          onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
        />
      </div>
      <div className="block md:hidden">
        <WorksSpList
          works={displayWorks}
          sort={props.sort}
          orderBy={props.orderBy}
        />
      </div>
    </>
  )
}
