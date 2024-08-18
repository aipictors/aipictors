import type { SortType } from "~/types/sort-type"
import { WorksSpList } from "~/routes/($lang).my._index/components/works-sp-list"
import {
  WorksListTable,
  WorksListTableItemFragment,
} from "~/routes/($lang).my._index/components/works-list-table"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { type FragmentOf, graphql } from "gql.tada"

type Props = {
  works: FragmentOf<typeof WorkListItemFragment>[]
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
export function WorksList(props: Props) {
  return (
    <>
      <div className="hidden md:block">
        <WorksListTable
          works={props.works}
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
          works={props.works}
          sort={props.sort}
          orderBy={props.orderBy}
        />
      </div>
    </>
  )
}

export const WorkListItemFragment = graphql(
  `fragment WorkListItem on WorkNode @_unmask {
    ...WorksListTableItem
  }`,
  [WorksListTableItemFragment],
)
