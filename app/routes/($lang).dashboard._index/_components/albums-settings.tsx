import type { SortType } from "@/_types/sort-type"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"
import type { WorkTabType } from "@/routes/($lang).dashboard._index/_types/work-tab-type"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/_components/ui/select"
import { useState } from "react"
import { WorksListFilterSettingButton } from "@/routes/($lang).dashboard._index/_components/works-list-filter-setting-button"
import type {
  AlbumOrderBy,
  AlbumRating,
} from "@/_graphql/__generated__/graphql"
import { toRatingText } from "@/_utils/work/to-rating-text"
import { WorksSettingContents } from "@/routes/($lang).dashboard._index/_components/works-settings-contents"
import { AlbumsListSortableSetting } from "@/routes/($lang).dashboard._index/_components/albums-list-sortable-setting"

type Props = {
  workTabType: WorkTabType | null
  sort: SortType
  orderBy: AlbumOrderBy
  rating: AlbumRating | null
  sumWorksCount: number
  sumAlbumsCount: number
  setWorkTabType: (workTabType: WorkTabType | null) => void
  setRating: (rating: AlbumRating | null) => void
  setSort: (sort: SortType) => void
  onClickAlbumTitleSortButton: () => void
  onClickAlbumDateSortButton: () => void
}

/**
 * アルバム設定
 */
export const AlbumsSetting = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [maxHeight, setMaxHeight] = useState("0px")

  const [opacity, setOpacity] = useState(0)

  const allSortType = ["DATE_CREATED", "NAME"] as AlbumOrderBy[]

  const onToggleFilterButton = () => {
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
        <>
          <div className="flex">
            <WorksSettingContents
              workTabType={props.workTabType}
              sumWorksCount={props.sumWorksCount}
              sumAlbumsCount={props.sumAlbumsCount}
              setWorkTabType={props.setWorkTabType}
            />
            <div className="ml-auto flex space-x-2">
              <WorksListFilterSettingButton
                onToggleFilterButton={onToggleFilterButton}
              />
            </div>
          </div>
          <div
            className="mt-4 mb-4"
            style={{
              maxHeight: maxHeight,
              overflow: "hidden",
              transition: "max-height 0.3s ease-out, opacity 0.3s ease-out",
              opacity: opacity,
            }}
          >
            <div className="flex space-x-4">
              <Select
                value={props.rating ? props.rating : ""}
                onValueChange={(value) => {
                  if (value === "ALL") {
                    props.setRating(null)
                    return
                  }
                  props.setRating(value as AlbumRating)
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
                  <SelectItem value="G">{"G"}</SelectItem>
                  <SelectItem value="R18">{"R18"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
        {!isDesktop && (
          <AlbumsListSortableSetting
            nowSort={props.sort}
            nowOrderBy={props.orderBy}
            allOrderBy={allSortType}
            setSort={props.setSort}
            onClickAlbumTitleSortButton={props.onClickAlbumTitleSortButton}
            onClickAlbumDateSortButton={props.onClickAlbumDateSortButton}
          />
        )}
      </div>
    </>
  )
}
