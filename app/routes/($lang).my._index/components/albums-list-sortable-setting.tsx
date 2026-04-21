import { ChevronDown, ChevronUp, GripVertical } from "lucide-react"
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer"
import type { SortType } from "~/types/sort-type"
import { SortListSelector } from "~/components/sort-list-selector"
import type { IntrospectionEnum } from "~/lib/introspection-enum"

type Props = {
  nowSort: SortType
  allOrderBy: IntrospectionEnum<"AlbumOrderBy">[]
  nowOrderBy: IntrospectionEnum<"AlbumOrderBy">
  setSort: (sort: SortType) => void
  onClickAlbumTitleSortButton: () => void
  onClickAlbumDateSortButton: () => void
  onClickAlbumUpdatedSortButton: () => void
  onClickAlbumManualSortButton: () => void
}

/**
 * シリーズソート
 */
export function AlbumsListSortableSetting (props: Props) {
  const getLabel = (nowOrderBy: IntrospectionEnum<"AlbumOrderBy">) => {
    switch (nowOrderBy) {
      case "DATE_CREATED":
        return "作成日順"
      case "DATE_UPDATED":
        return "更新日順"
      case "MANUAL":
        return "手動"
      case "NAME":
        return "タイトル順"
      default:
        return "作成日順"
    }
  }

  const onClickAlbumTitleSortButton = () => {
    // もしいま同じソート種別なら降順を変更する
    if (props.nowOrderBy === "NAME") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickAlbumTitleSortButton()
    }
  }

  const onClickAlbumDateSortButton = () => {
    if (props.nowOrderBy === "DATE_CREATED") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickAlbumDateSortButton()
    }
  }

  const onClickAlbumUpdatedSortButton = () => {
    if (props.nowOrderBy === "DATE_UPDATED") {
      if (props.nowSort === "ASC") {
        props.setSort("DESC")
      } else {
        props.setSort("ASC")
      }
    } else {
      props.onClickAlbumUpdatedSortButton()
    }
  }
  return (
    <>
      <Drawer>
        <DrawerTrigger>
          <div className="mb-4 text-md">
            <div className="flex items-center">
              {getLabel(props.nowOrderBy)}
              {props.nowOrderBy === "MANUAL" ? (
                <GripVertical className="ml-1 size-4" />
              ) : props.nowSort === "ASC" ? (
                <ChevronUp />
              ) : (
                <ChevronDown />
              )}
            </div>
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <SortListSelector
            sortList={[
              {
                sort: "ASC",
                sortType: "NAME",
                label: "タイトル順",
                callback: onClickAlbumTitleSortButton,
              },
              {
                sort: "ASC",
                sortType: "DATE_CREATED",
                label: "作成日順",
                callback: onClickAlbumDateSortButton,
              },
              {
                sort: "ASC",
                sortType: "DATE_UPDATED",
                label: "更新日順",
                callback: onClickAlbumUpdatedSortButton,
              },
              {
                sort: "DESC",
                sortType: "MANUAL",
                label: "手動",
                callback: props.onClickAlbumManualSortButton,
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
