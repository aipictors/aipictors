import { ChevronDown, ChevronUp } from "lucide-react"
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer"
import type { SortType } from "~/types/sort-type"
import { SortListSelector } from "~/components/sort-list-selector"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { Button } from "~/components/ui/button"
import { Dialog, DialogTrigger, DialogContent } from "~/components/ui/dialog"
import { useTranslation } from "~/hooks/use-translation"

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
 * 作品一覧の並び順設定コンポーネント
 */
export function EventWorksListSortableSetting(props: Props) {
  const t = useTranslation()

  /**
   * 並び順のラベルを取得する関数
   */
  const getLabel = (nowOrderBy: IntrospectionEnum<"WorkOrderBy">) => {
    switch (nowOrderBy) {
      case "LIKES_COUNT":
        return t("いいね！順", "Likes Count")
      case "BOOKMARKS_COUNT":
        return t("ブックマーク順", "Bookmarks Count")
      case "COMMENTS_COUNT":
        return t("コメント順", "Comments Count")
      case "VIEWS_COUNT":
        return t("閲覧数順", "Views Count")
      case "DATE_CREATED":
        return t("日付順", "Date Created")
      case "NAME":
        return t("タイトル順", "Title")
      case "IS_PROMOTION":
        return t("宣伝作品順", "Promotion")
      default:
        return t("日付順", "Date Created")
    }
  }
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
                        label: t("いいね！順", "Likes Count"),
                        callback: onClickLikeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "BOOKMARKS_COUNT",
                        label: t("ブックマーク順", "Bookmarks Count"),
                        callback: onClickBookmarkSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "COMMENTS_COUNT",
                        label: t("コメント順", "Comments Count"),
                        callback: onClickCommentSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "VIEWS_COUNT",
                        label: t("閲覧数順", "Views Count"),
                        callback: onClickViewSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "NAME",
                        label: t("タイトル順", "Title"),
                        callback: onClickTitleSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "WORK_TYPE",
                        label: t("種別順", "Work Type"),
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: t("宣伝作品順", "Promotion"),
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "ACCESS_TYPE",
                        label: t("状態順", "Access Type"),
                        callback: onClickAccessTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: t("日付順", "Date Created"),
                        callback: onClickDateSortButton,
                      },
                    ]
                  : [
                      {
                        sort: "ASC",
                        sortType: "LIKES_COUNT",
                        label: t("いいね！順", "Likes Count"),
                        callback: onClickLikeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "BOOKMARKS_COUNT",
                        label: t("ブックマーク順", "Bookmarks Count"),
                        callback: onClickBookmarkSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "COMMENTS_COUNT",
                        label: t("コメント順", "Comments Count"),
                        callback: onClickCommentSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "VIEWS_COUNT",
                        label: t("閲覧数順", "Views Count"),
                        callback: onClickViewSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "NAME",
                        label: t("タイトル順", "Title"),
                        callback: onClickTitleSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "WORK_TYPE",
                        label: t("種別順", "Work Type"),
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: t("宣伝作品順", "Promotion"),
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: t("日付順", "Date Created"),
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
              {getLabel(props.nowOrderBy)}
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
                        label: t("いいね！順", "Likes Count"),
                        callback: onClickLikeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "BOOKMARKS_COUNT",
                        label: t("ブックマーク順", "Bookmarks Count"),
                        callback: onClickBookmarkSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "COMMENTS_COUNT",
                        label: t("コメント順", "Comments Count"),
                        callback: onClickCommentSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "VIEWS_COUNT",
                        label: t("閲覧数順", "Views Count"),
                        callback: onClickViewSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "NAME",
                        label: t("タイトル順", "Title"),
                        callback: onClickTitleSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "WORK_TYPE",
                        label: t("種別順", "Work Type"),
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: t("宣伝作品順", "Promotion"),
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "ACCESS_TYPE",
                        label: t("状態順", "Access Type"),
                        callback: onClickAccessTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: t("日付順", "Date Created"),
                        callback: onClickDateSortButton,
                      },
                    ]
                  : [
                      {
                        sort: "ASC",
                        sortType: "LIKES_COUNT",
                        label: t("いいね！順", "Likes Count"),
                        callback: onClickLikeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "BOOKMARKS_COUNT",
                        label: t("ブックマーク順", "Bookmarks Count"),
                        callback: onClickBookmarkSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "COMMENTS_COUNT",
                        label: t("コメント順", "Comments Count"),
                        callback: onClickCommentSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "VIEWS_COUNT",
                        label: t("閲覧数順", "Views Count"),
                        callback: onClickViewSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "NAME",
                        label: t("タイトル順", "Title"),
                        callback: onClickTitleSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "WORK_TYPE",
                        label: t("種別順", "Work Type"),
                        callback: onClickWorkTypeSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "IS_PROMOTION",
                        label: t("宣伝作品順", "Promotion"),
                        callback: onClickIsPromotionSortButton,
                      },
                      {
                        sort: "ASC",
                        sortType: "DATE_CREATED",
                        label: t("日付順", "Date Created"),
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
