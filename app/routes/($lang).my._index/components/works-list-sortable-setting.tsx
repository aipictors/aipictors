import { ChevronDown, ChevronUp } from "lucide-react"
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer"
import type { SortType } from "~/types/sort-type"
import { SortListSelector } from "~/components/sort-list-selector"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Button } from "~/components/ui/button"
import { Dialog, DialogTrigger, DialogContent } from "~/components/ui/dialog"

type Props = {
  nowSort: SortType
  allOrderBy: IntrospectionEnum<"WorkOrderBy">[]
  nowOrderBy: IntrospectionEnum<"WorkOrderBy">
  setSort: (sort: SortType) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickAccessTypeSortButton?: () => void
  onClickDateSortButton: () => void
  onClickWorkTypeSortButton: () => void
  onClickIsPromotionSortButton: () => void
}

/**
 * 並び順のラベルを取得する関数
 */
const getLabel = (nowOrderBy: IntrospectionEnum<"WorkOrderBy">) => {
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
    case "IS_PROMOTION":
      return "宣伝作品順"
    default:
      return "日付順"
  }
}

/**
 * 作品一覧の並び順設定コンポーネント
 */
export function WorksListSortableSetting(props: Props) {
  const onClickLikeSortButton = () => {
    if (props.nowOrderBy === "LIKES_COUNT") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickLikeSortButton()
    }
  }

  const onClickBookmarkSortButton = () => {
    if (props.nowOrderBy === "BOOKMARKS_COUNT") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickBookmarkSortButton()
    }
  }

  const onClickCommentSortButton = () => {
    if (props.nowOrderBy === "COMMENTS_COUNT") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickCommentSortButton()
    }
  }

  const onClickViewSortButton = () => {
    if (props.nowOrderBy === "VIEWS_COUNT") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickViewSortButton()
    }
  }

  const onClickTitleSortButton = () => {
    if (props.nowOrderBy === "NAME") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickTitleSortButton()
    }
  }

  const onClickAccessTypeSortButton =
    props.onClickAccessTypeSortButton !== undefined
      ? () => {
          if (props.nowOrderBy === "ACCESS_TYPE") {
            props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
          } else {
            props.onClickAccessTypeSortButton?.()
          }
        }
      : undefined

  const onClickDateSortButton = () => {
    if (props.nowOrderBy === "DATE_CREATED") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickDateSortButton()
    }
  }

  const onClickWorkTypeSortButton = () => {
    if (props.nowOrderBy === "WORK_TYPE") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickWorkTypeSortButton()
    }
  }

  const onClickIsPromotionSortButton = () => {
    if (props.nowOrderBy === "IS_PROMOTION") {
      props.setSort(props.nowSort === "ASC" ? "DESC" : "ASC")
    } else {
      props.onClickIsPromotionSortButton()
    }
  }

  return (
    <>
      <div className="block md:hidden">
        <Drawer>
          <DrawerTrigger>
            <div className="flex items-center">
              {getLabel(props.nowOrderBy)}
              {props.nowSort === "ASC" ? <ChevronUp /> : <ChevronDown />}
            </div>
          </DrawerTrigger>
          <DrawerContent>
            <SortListSelector
              sortList={
                onClickAccessTypeSortButton
                  ? [
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
                        sortType: "WORK_TYPE",
                        label: "種別順",
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: "宣伝作品順",
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "ACCESS_TYPE",
                        label: "状態順",
                        callback: onClickAccessTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: "日付順",
                        callback: onClickDateSortButton,
                      },
                    ]
                  : [
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
                        sortType: "WORK_TYPE",
                        label: "種別順",
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: "宣伝作品順",
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: "日付順",
                        callback: onClickDateSortButton,
                      },
                    ]
              }
              nowSort={props.nowSort}
              nowSortType={props.nowOrderBy}
            />
          </DrawerContent>
        </Drawer>
      </div>
      <div className="hidden md:block">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-full">
              {getLabel(props.nowOrderBy)}{" "}
              {props.nowSort === "ASC" ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <SortListSelector
              sortList={
                onClickAccessTypeSortButton
                  ? [
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
                        sortType: "WORK_TYPE",
                        label: "種別順",
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: "宣伝作品順",
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "ACCESS_TYPE",
                        label: "状態順",
                        callback: onClickAccessTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: "日付順",
                        callback: onClickDateSortButton,
                      },
                    ]
                  : [
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
                        sortType: "WORK_TYPE",
                        label: "種別順",
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: "宣伝作品順",
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: "日付順",
                        callback: onClickDateSortButton,
                      },
                    ]
              }
              nowSort={props.nowSort}
              nowSortType={props.nowOrderBy}
            />
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
