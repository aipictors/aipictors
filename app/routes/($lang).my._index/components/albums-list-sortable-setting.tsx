import { ChevronDown, ChevronUp } from "lucide-react"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import type { SortType } from "@/types/sort-type"
import { SortListSelector } from "@/components/sort-list-selector"
import type { IntrospectionEnum } from "@/lib/introspection-enum"

type Props = {
  nowSort: SortType
  allOrderBy: IntrospectionEnum<"AlbumOrderBy">[]
  nowOrderBy: IntrospectionEnum<"AlbumOrderBy">
  setSort: (sort: SortType) => void
  onClickAlbumTitleSortButton: () => void
  onClickAlbumDateSortButton: () => void
}

/**
 * シリーズソート
 */
export const AlbumsListSortableSetting = (props: Props) => {
  const getLabel = (nowOrderBy: IntrospectionEnum<"AlbumOrderBy">) => {
    switch (nowOrderBy) {
      case "DATE_CREATED":
        return "日付順"
      case "NAME":
        return "タイトル順"
      default:
        return "日付順"
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
                sortType: "NAME",
                label: "タイトル順",
                callback: onClickAlbumTitleSortButton,
              },
              {
                sort: "ASC",
                sortType: "DATE_CREATED",
                label: "日付順",
                callback: onClickAlbumDateSortButton,
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
