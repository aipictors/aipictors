import type { SortType } from "@/_types/sort-type"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"
import { WorksSpList } from "@/routes/($lang).dashboard._index/_components/works-sp-list"
import { WorksListTable } from "@/routes/($lang).dashboard._index/_components/works-list-table"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

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
    accessType: IntrospectionEnum<"AccessType">
    isTagEditable: boolean
  }[]
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  setWorkTabType: (workTabType: WorkTabType | null) => void
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

  return (
    <>
      {isDesktop ? (
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
        />
      ) : (
        <WorksSpList
          works={displayWorks}
          sort={props.sort}
          orderBy={props.orderBy}
        />
      )}
    </>
  )
}
