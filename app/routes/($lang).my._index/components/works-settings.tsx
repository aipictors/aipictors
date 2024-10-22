import type { SortType } from "~/types/sort-type"
import { WorksListSortableSetting } from "~/routes/($lang).my._index/components/works-list-sortable-setting"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { useState } from "react"
import { toAccessTypeText } from "~/utils/work/to-access-type-text"
import { toRatingText } from "~/utils/work/to-rating-text"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { useTranslation } from "~/hooks/use-translation"
import { useLocale } from "~/hooks/use-locale"

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
  onClickIsPromotionSortButton: () => void
}

/**
 * 一覧設定
 */
export function WorksSetting(props: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [maxHeight, setMaxHeight] = useState("0px")
  const [opacity, setOpacity] = useState(0)
  const t = useTranslation()

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

  const location = useLocale()

  return (
    <>
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
                  : t("公開範囲", "Access Range")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("公開範囲", "Access Range")}</SelectItem>
            <SelectItem value="PUBLIC">{t("公開", "Public")}</SelectItem>
            <SelectItem value="SILENT">
              {t("公開(新着無)", "Public (No New)")}
            </SelectItem>
            <SelectItem value="LIMITED">{t("限定公開", "Limited")}</SelectItem>
            <SelectItem value="PRIVATE">{t("非公開", "Private")}</SelectItem>
            <SelectItem value="DRAFT">{t("下書き", "Draft")}</SelectItem>
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
                props.workType
                  ? toWorkTypeText({
                      type: props.workType,
                      lang: location,
                    })
                  : t("種類", "Type")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("種類", "Type")}</SelectItem>
            <SelectItem value="WORK">{t("画像", "Image")}</SelectItem>
            <SelectItem value="VIDEO">{t("動画", "Video")}</SelectItem>
            <SelectItem value="NOVEL">{t("小説", "Novel")}</SelectItem>
            <SelectItem value="COLUMN">{t("コラム", "Column")}</SelectItem>
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
                props.rating
                  ? toRatingText(props.rating)
                  : t("年齢制限", "Rating")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("年齢制限", "Rating")}</SelectItem>
            <SelectItem value="G">{t("全年齢", "All Ages")}</SelectItem>
            <SelectItem value="R15">{t("R15", "R15")}</SelectItem>
            <SelectItem value="R18">{t("R18", "R18")}</SelectItem>
            <SelectItem value="R18G">{t("R18G", "R18G")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
          onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
        />
      </div>
    </>
  )
}
