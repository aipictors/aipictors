import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { AlbumsListSortableSetting } from "~/routes/($lang).my._index/components/albums-list-sortable-setting"
import type { SortType } from "~/types/sort-type"
import { toRatingText } from "~/utils/work/to-rating-text"

type Props = {
  sort: SortType
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  rating: IntrospectionEnum<"AlbumRating"> | null
  sumAlbumsCount: number
  setRating: (rating: IntrospectionEnum<"AlbumRating"> | null) => void
  setSort: (sort: SortType) => void
  onClickAlbumTitleSortButton: () => void
  onClickAlbumDateSortButton: () => void
  onClickAlbumUpdatedSortButton: () => void
  onClickAlbumManualSortButton: () => void
}

/**
 * アルバム設定
 */
export function AlbumsSetting(props: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [maxHeight, setMaxHeight] = useState("0px")

  const [opacity, setOpacity] = useState(0)

  const allSortType = [
    "DATE_CREATED",
    "DATE_UPDATED",
    "MANUAL",
    "NAME",
  ] as IntrospectionEnum<"AlbumOrderBy">[]

  const onValueChangeOrderBy = (value: string) => {
    if (value === "NAME") {
      props.onClickAlbumTitleSortButton()
      return
    }

    if (value === "DATE_CREATED") {
      props.onClickAlbumDateSortButton()
      return
    }

    if (value === "DATE_UPDATED") {
      props.onClickAlbumUpdatedSortButton()
      return
    }

    if (value === "MANUAL") {
      props.onClickAlbumManualSortButton()
    }
  }

  const _onToggleFilterButton = () => {
    if (isFilterOpen) {
      setMaxHeight("0px")
      setOpacity(0)
    } else {
      setMaxHeight("480px") // 適切な高さに調整
      setOpacity(1)
    }
    setIsFilterOpen(!isFilterOpen)
  }

  return (
    <>
      <div className="mb-4">
        <div
          className="mt-4 mb-4"
          style={{
            maxHeight: maxHeight,
            overflow: "hidden",
            transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
            opacity: opacity,
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row">
            <Select value={props.orderBy} onValueChange={onValueChangeOrderBy}>
              <SelectTrigger>
                <SelectValue placeholder="並び順" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAME">{"タイトル順"}</SelectItem>
                <SelectItem value="DATE_CREATED">{"作成日順"}</SelectItem>
                <SelectItem value="DATE_UPDATED">{"更新日順"}</SelectItem>
                <SelectItem value="MANUAL">{"手動"}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={props.rating ? props.rating : ""}
              onValueChange={(value) => {
                if (value === "ALL") {
                  props.setRating(null)
                  return
                }
                props.setRating(value as IntrospectionEnum<"AlbumRating">)
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    props.rating
                      ? toRatingText(props.rating)
                      : "すべての年齢制限"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{"すべての年齢制限"}</SelectItem>
                <SelectItem value="G">{"全年齢"}</SelectItem>
                <SelectItem value="R15">{"R15"}</SelectItem>
                <SelectItem value="R18">{"R18"}</SelectItem>
                <SelectItem value="R18G">{"R18G"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="block md:hidden">
          <AlbumsListSortableSetting
            nowSort={props.sort}
            nowOrderBy={props.orderBy}
            allOrderBy={allSortType}
            setSort={props.setSort}
            onClickAlbumTitleSortButton={props.onClickAlbumTitleSortButton}
            onClickAlbumDateSortButton={props.onClickAlbumDateSortButton}
            onClickAlbumUpdatedSortButton={props.onClickAlbumUpdatedSortButton}
            onClickAlbumManualSortButton={props.onClickAlbumManualSortButton}
          />
        </div>
      </div>
    </>
  )
}
