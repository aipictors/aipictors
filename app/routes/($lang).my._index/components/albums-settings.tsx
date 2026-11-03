import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"

type Props = {
  sort: SortType
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  rating: IntrospectionEnum<"AlbumRating"> | null
  setRating: (rating: IntrospectionEnum<"AlbumRating"> | null) => void
  onSort: (orderBy: IntrospectionEnum<"AlbumOrderBy">, sort: SortType) => void
}

const SORT_OPTIONS: {
  orderBy: IntrospectionEnum<"AlbumOrderBy">
  sort: SortType
  ja: string
  en: string
}[] = [
  { orderBy: "DATE_CREATED", sort: "DESC", ja: "新しい順", en: "Newest" },
  { orderBy: "DATE_CREATED", sort: "ASC", ja: "古い順", en: "Oldest" },
  {
    orderBy: "DATE_UPDATED",
    sort: "DESC",
    ja: "更新が新しい順",
    en: "Recently updated",
  },
  { orderBy: "NAME", sort: "ASC", ja: "タイトル順", en: "Title" },
  { orderBy: "MANUAL", sort: "DESC", ja: "手動で並べる", en: "Manual order" },
]

/**
 * シリーズの並び順と絞り込み
 */
export function AlbumsSetting(props: Props) {
  const t = useTranslation()
  return (
    <div className="mb-3 grid grid-cols-2 gap-2 md:max-w-md">
      <Select
        value={`${props.orderBy}:${props.sort}`}
        onValueChange={(value) => {
          const option = SORT_OPTIONS.find(
            (item) => `${item.orderBy}:${item.sort}` === value,
          )
          if (option) props.onSort(option.orderBy, option.sort)
        }}
      >
        <SelectTrigger
          aria-label={t("並び順", "Sort")}
          className="h-9 rounded-lg text-xs md:text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem
              key={`${option.orderBy}:${option.sort}`}
              value={`${option.orderBy}:${option.sort}`}
            >
              {t(option.ja, option.en)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={props.rating ?? "ALL"}
        onValueChange={(value) =>
          props.setRating(
            value === "ALL"
              ? null
              : (value as IntrospectionEnum<"AlbumRating">),
          )
        }
      >
        <SelectTrigger
          aria-label={t("年齢制限", "Rating")}
          className="h-9 rounded-lg text-xs md:text-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">
            {t("すべての年齢", "All ratings")}
          </SelectItem>
          <SelectItem value="G">{t("全年齢", "All ages")}</SelectItem>
          <SelectItem value="R15">R-15</SelectItem>
          <SelectItem value="R18">R-18</SelectItem>
          <SelectItem value="R18G">R-18G</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
