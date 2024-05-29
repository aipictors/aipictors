import { ChevronDown, ChevronUp } from "lucide-react"
import { Drawer, DrawerContent, DrawerTrigger } from "@/_components/ui/drawer"
import type { SortType } from "@/_types/sort-type"
import { SortListSelector } from "@/_components/sort-list-selector"
import type { WorkOrderBy } from "@/_graphql/__generated__/graphql"

type Props = {
  nowSort: SortType
  allOrderBy: WorkOrderBy[]
  nowOrderBy: WorkOrderBy
  setSort: (sort: SortType) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickDateSortButton: () => void
}

/**
 * 作品一覧
 */
export const WorksListSortableSetting = (props: Props) => {
  const getLabel = (nowOrderBy: WorkOrderBy) => {
    switch (nowOrderBy) {
      case "LIKES_COUNT":
        return "いいね！順"
      case "BOOKMARKS_COUNT":
        return "ブックマーク順"
      case "COMMENTS_COUNT":
        return "コメント順"
      case "VIEWS_COUNT":
        return "閲覧数順"
      case "DATE_CREATED":
        return "日付順"
      case "NAME":
        return "タイトル順"
      default:
        return "日付順"
    }
  }

  const onClickLikeSortButton = () => {
    // もしいま同じソート種別なら降順を変更する
    if (props.nowOrderBy === "LIKES_COUNT") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickLikeSortButton()
    }
  }

  const onClickBookmarkSortButton = () => {
    if (props.nowOrderBy === "BOOKMARKS_COUNT") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickBookmarkSortButton()
    }
  }

  const onClickCommentSortButton = () => {
    if (props.nowOrderBy === "COMMENTS_COUNT") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickCommentSortButton()
    }
  }

  const onClickViewSortButton = () => {
    if (props.nowOrderBy === "VIEWS_COUNT") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickViewSortButton()
    }
  }

  const onClickTitleSortButton = () => {
    if (props.nowOrderBy === "NAME") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickTitleSortButton()
    }
  }

  const onClickDateSortButton = () => {
    if (props.nowOrderBy === "DATE_CREATED") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickDateSortButton()
    }
  }

  return (
    <>
      <Drawer>
        <DrawerTrigger>
          <div className="mb-4 text-md">
            <div className="flex items-center">
              {getLabel(props.nowOrderBy)}
              {props.nowSort === "ASC" ? <ChevronUp /> : <ChevronDown />}
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <SortListSelector
            sortList={[
              {
                sort: "ASC",
                sortType: "LIKES_COUNT",
                label: "いいね！順",
                callback: onClickLikeSortButton,
              },
              {
                sort: "ASC",
                sortType: "BOOKMARKS_COUNT",
                label: "ブックマーク順",
                callback: onClickBookmarkSortButton,
              },
              {
                sort: "ASC",
                sortType: "COMMENTS_COUNT",
                label: "コメント順",
                callback: onClickCommentSortButton,
              },
              {
                sort: "ASC",
                sortType: "VIEWS_COUNT",
                label: "閲覧数順",
                callback: onClickViewSortButton,
              },
              {
                sort: "ASC",
                sortType: "NAME",
                label: "タイトル順",
                callback: onClickTitleSortButton,
              },
              {
                sort: "ASC",
                sortType: "DATE_CREATED",
                label: "日付順",
                callback: onClickDateSortButton,
              },
            ]}
            nowSort={props.nowSort}
            nowSortType={props.nowOrderBy}
          />
        </DrawerContent>
      </Drawer>
    </>
  )
}
