import type { SortType } from "@/_types/sort-type"
import { WorksListSortableSetting } from "@/routes/($lang).my._index/_components/works-list-sortable-setting"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/_components/ui/select"
import { useState } from "react"
import { toAccessTypeText } from "@/_utils/work/to-access-type-text"
import { toRatingText } from "@/_utils/work/to-rating-text"
import type { IntrospectionEnum } from "@/_lib/introspection-enum"
import { toWorkTypeText } from "@/_utils/work/to-work-type-text"

type Props = {
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  sumWorksCount: number
  setAccessType: (accessType: IntrospectionEnum<"AccessType"> | null) => void
  setWorkType: (workType: IntrospectionEnum<"WorkType"> | null) => void
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
 * 一覧設定
 */
export const WorksSetting = (props: Props) => {
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
          <div className="mt-4 mb-4">
            <div className="flex space-x-4">
              {/* 公開範囲 */}
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
                        : "公開範囲"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{"公開範囲"}</SelectItem>
                  <SelectItem value="PUBLIC">{"公開"}</SelectItem>
                  <SelectItem value="SILENT">{"公開(新着無)"}</SelectItem>
                  <SelectItem value="LIMITED">{"限定公開"}</SelectItem>
                  <SelectItem value="PRIVATE">{"非公開"}</SelectItem>
                  <SelectItem value="DRAFT">{"下書き"}</SelectItem>
                </SelectContent>
              </Select>
              {/* 作品種別 */}
              <Select
                value={props.workType ? props.workType : ""}
                onValueChange={(value) => {
                  if (value === "ALL") {
                    props.setWorkType(null)
                    return
                  }
                  props.setWorkType(value as IntrospectionEnum<"WorkType">)
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      props.workType ? toWorkTypeText(props.workType) : "種類"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{"種類"}</SelectItem>
                  <SelectItem value="WORK">{"画像"}</SelectItem>
                  <SelectItem value="VIDEO">{"動画"}</SelectItem>
                  <SelectItem value="NOVEL">{"小説"}</SelectItem>
                  <SelectItem value="COLUMN">{"コラム"}</SelectItem>
                </SelectContent>
              </Select>

              {/* 年齢制限 */}
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
                      props.rating ? toRatingText(props.rating) : "年齢制限"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{"年齢制限"}</SelectItem>
                  <SelectItem value="G">{"全年齢"}</SelectItem>
                  <SelectItem value="R15">{"R15"}</SelectItem>
                  <SelectItem value="R18">{"R18"}</SelectItem>
                  <SelectItem value="R18G">{"R18G"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
        <div className="block md:hidden">
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
            onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
          />
        </div>
      </div>
    </>
  )
}
