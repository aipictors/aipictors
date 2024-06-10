import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import type { SortType } from "@/_types/sort-type"
import { WorksListSortableSetting } from "@/routes/($lang).dashboard._index/_components/works-list-sortable-setting"

type Props = {
  nowSort: IntrospectionEnum<"WorkOrderBy">
  setSort: (sort: IntrospectionEnum<"WorkOrderBy">) => void
  nowOrder: SortType
  setOrder: (order: SortType) => void
}

/**
 * 作品ソート設定
 */
export const WorkSortSetting = (props: Props) => {
  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

  const onClickTitleSortButton = () => {
    props.setSort("NAME")
    props.setOrder(props.nowOrder === "ASC" ? "DESC" : "ASC")
  }

  const onClickLikeSortButton = () => {
    props.setSort("LIKES_COUNT")
    props.setOrder(props.nowOrder === "ASC" ? "DESC" : "ASC")
  }

  const onClickBookmarkSortButton = () => {
    props.setSort("BOOKMARKS_COUNT")
    props.setOrder(props.nowOrder === "ASC" ? "DESC" : "ASC")
  }

  const onClickCommentSortButton = () => {
    props.setSort("COMMENTS_COUNT")
    props.setOrder(props.nowOrder === "ASC" ? "DESC" : "ASC")
  }

  const onClickViewSortButton = () => {
    props.setSort("VIEWS_COUNT")
    props.setOrder(props.nowOrder === "ASC" ? "DESC" : "ASC")
  }

  const onClickAccessTypeSortButton = () => {
    props.setSort("ACCESS_TYPE")
    props.setOrder(props.nowOrder === "ASC" ? "DESC" : "ASC")
  }

  const onClickDateSortButton = () => {
    props.setSort("DATE_CREATED")
    props.setOrder(props.nowOrder === "ASC" ? "DESC" : "ASC")
  }

  return (
    <WorksListSortableSetting
      nowSort={props.nowOrder}
      nowOrderBy={props.nowSort}
      allOrderBy={allSortType}
      setSort={props.setOrder}
      onClickTitleSortButton={onClickTitleSortButton}
      onClickLikeSortButton={onClickLikeSortButton}
      onClickBookmarkSortButton={onClickBookmarkSortButton}
      onClickCommentSortButton={onClickCommentSortButton}
      onClickViewSortButton={onClickViewSortButton}
      onClickAccessTypeSortButton={onClickAccessTypeSortButton}
      onClickDateSortButton={onClickDateSortButton}
    />
  )
}
