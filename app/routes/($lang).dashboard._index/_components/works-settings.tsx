import type { SortType } from "@/_types/sort-type"
import { config } from "@/config"
import { useMediaQuery } from "usehooks-ts"
import { WorksListSortableSetting } from "@/routes/($lang).dashboard._index/_components/works-list-sortable-setting"
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
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"
import { toRatingText } from "@/_utils/work/to-rating-text"
import { WorksSettingContents } from "@/routes/($lang).dashboard._index/_components/works-settings-contents"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"

type Props = {
  workTabType: WorkTabType | null
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  sumWorksCount: number
  sumAlbumsCount: number
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
 * 一覧設定
 */
export const WorksSetting = (props: Props) => {
  const isDesktop = useMediaQuery(config.mediaQuery.isDesktop)

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [maxHeight, setMaxHeight] = useState("0px")

  const [opacity, setOpacity] = useState(0)

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

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
          <div className="flex items-center">
            <WorksSettingContents
              workTabType={props.workTabType}
              sumWorksCount={props.sumWorksCount}
              sumAlbumsCount={props.sumAlbumsCount}
              setWorkTabType={props.setWorkTabType}
            />
            <div className="ml-auto">
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
                value={props.accessType ? props.accessType : ""}
                onValueChange={(value) => {
                  if (value === "ALL") {
                    props.setAccessType(null)
                    return
                  }
                  props.setAccessType(value as IntrospectionEnum<"AccessType">)
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      props.accessType
                        ? toAccessTypeText(props.accessType)
                        : "すべての公開範囲"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{"すべての公開範囲"}</SelectItem>
                  <SelectItem value="PUBLIC">{"公開"}</SelectItem>
                  <SelectItem value="SILENT">{"公開(新着無)"}</SelectItem>
                  <SelectItem value="LIMITED">{"限定公開"}</SelectItem>
                  <SelectItem value="PRIVATE">{"非公開"}</SelectItem>
                  <SelectItem value="DRAFT">{"下書き"}</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={props.rating ? props.rating : ""}
                onValueChange={(value) => {
                  if (value === "ALL") {
                    props.setRating(null)
                    return
                  }
                  props.setRating(value as IntrospectionEnum<"Rating">)
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
                  <SelectItem value="R15">{"R15"}</SelectItem>
                  <SelectItem value="R18">{"R18"}</SelectItem>
                  <SelectItem value="R18G">{"R18G"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
        {!isDesktop && (
          <WorksListSortableSetting
            nowSort={props.sort}
            nowOrderBy={props.orderBy}
            allOrderBy={allSortType}
            setSort={props.setSort}
            onClickTitleSortButton={props.onClickTitleSortButton}
            onClickLikeSortButton={props.onClickLikeSortButton}
            onClickBookmarkSortButton={props.onClickBookmarkSortButton}
            onClickCommentSortButton={props.onClickCommentSortButton}
            onClickViewSortButton={props.onClickViewSortButton}
            onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
            onClickDateSortButton={props.onClickDateSortButton}
          />
        )}
      </div>
    </>
  )
}
