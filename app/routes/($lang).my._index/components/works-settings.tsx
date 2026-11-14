import { SearchIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { cn } from "~/lib/utils"
import type { SortType } from "~/types/sort-type"

type Props = {
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  accessType: IntrospectionEnum<"AccessType"> | null
  workType: IntrospectionEnum<"WorkType"> | null
  rating: IntrospectionEnum<"Rating"> | null
  search: string
  perPage: number
  isFiltered: boolean
  setSearch: (search: string) => void
  setAccessType: (accessType: IntrospectionEnum<"AccessType"> | null) => void
  setWorkType: (workType: IntrospectionEnum<"WorkType"> | null) => void
  setRating: (rating: IntrospectionEnum<"Rating"> | null) => void
  onSort: (orderBy: IntrospectionEnum<"WorkOrderBy">, sort: SortType) => void
  onClickPerPageChange: (perPage: number) => void
  onClearFilters: () => void
}

/** 並び順の選択肢（並び順と向きをまとめて 1 つで選ぶ） */
const SORT_OPTIONS: {
  orderBy: IntrospectionEnum<"WorkOrderBy">
  sort: SortType
  ja: string
  en: string
}[] = [
  { orderBy: "DATE_CREATED", sort: "DESC", ja: "新しい順", en: "Newest" },
  { orderBy: "DATE_CREATED", sort: "ASC", ja: "古い順", en: "Oldest" },
  {
    orderBy: "LIKES_COUNT",
    sort: "DESC",
    ja: "いいねが多い順",
    en: "Most likes",
  },
  {
    orderBy: "LIKES_COUNT",
    sort: "ASC",
    ja: "いいねが少ない順",
    en: "Fewest likes",
  },
  {
    orderBy: "BOOKMARKS_COUNT",
    sort: "DESC",
    ja: "ブックマークが多い順",
    en: "Most bookmarks",
  },
  {
    orderBy: "BOOKMARKS_COUNT",
    sort: "ASC",
    ja: "ブックマークが少ない順",
    en: "Fewest bookmarks",
  },
  {
    orderBy: "COMMENTS_COUNT",
    sort: "DESC",
    ja: "コメントが多い順",
    en: "Most comments",
  },
  {
    orderBy: "COMMENTS_COUNT",
    sort: "ASC",
    ja: "コメントが少ない順",
    en: "Fewest comments",
  },
  {
    orderBy: "VIEWS_COUNT",
    sort: "DESC",
    ja: "閲覧が多い順",
    en: "Most views",
  },
  {
    orderBy: "VIEWS_COUNT",
    sort: "ASC",
    ja: "閲覧が少ない順",
    en: "Fewest views",
  },
  { orderBy: "NAME", sort: "ASC", ja: "タイトル順", en: "Title A-Z" },
  { orderBy: "NAME", sort: "DESC", ja: "タイトル逆順", en: "Title Z-A" },
]

/**
 * 作品一覧の検索と絞り込み
 */
export function WorksSetting(props: Props) {
  const t = useTranslation()
  const [searchText, setSearchText] = useState(props.search)

  useEffect(() => {
    setSearchText(props.search)
  }, [props.search])

  // 日本語の変換中（かなを打っている途中）は検索しない。
  // iPhone の Safari は変換中も入力値が変わるので、「うちゅ」のような途中の文字で検索されていた
  const [isComposing, setIsComposing] = useState(false)

  // 打ち終わってから検索する
  useEffect(() => {
    if (isComposing) return
    const value = searchText.trim()
    if (value === props.search) return
    const timer = setTimeout(() => props.setSearch(value), 600)
    return () => clearTimeout(timer)
  }, [searchText, isComposing, props.search, props.setSearch])

  const accessTabs: {
    value: IntrospectionEnum<"AccessType"> | null
    label: string
  }[] = [
    { value: null, label: t("すべて", "All") },
    { value: "PUBLIC", label: t("公開", "Public") },
    { value: "SILENT", label: t("新着なし", "No new") },
    { value: "LIMITED", label: t("限定公開", "Limited") },
    { value: "PRIVATE", label: t("非公開", "Private") },
    { value: "DRAFT", label: t("下書き", "Draft") },
  ]

  const sortValue = `${props.orderBy}:${props.sort}`
  const selectClassName = "h-9 min-w-0 rounded-lg text-xs md:text-sm"

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={(event) => {
            setIsComposing(false)
            setSearchText(event.currentTarget.value)
          }}
          onKeyDown={(event) => {
            // 確定済みの文字で Enter を押したら、待たずに検索する
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault()
              props.setSearch(searchText.trim())
            }
          }}
          enterKeyHint="search"
          placeholder={t(
            "タイトル・説明・タグで探す",
            "Search by title, description or tag",
          )}
          aria-label={t("自分の作品を検索", "Search your works")}
          className="h-10 rounded-xl pr-9 pl-9 text-base md:text-sm"
        />
        {searchText.length > 0 && (
          <button
            type="button"
            aria-label={t("検索を消す", "Clear search")}
            onClick={() => {
              setSearchText("")
              props.setSearch("")
            }}
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <XIcon className="size-4" />
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label={t("公開範囲", "Access")}
        className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none]"
      >
        {accessTabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            aria-pressed={props.accessType === tab.value}
            onClick={() => props.setAccessType(tab.value)}
            className={cn(
              "h-8 shrink-0 whitespace-nowrap rounded-full border px-3 font-medium text-xs transition-colors",
              props.accessType === tab.value
                ? "border-foreground bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Select
          value={sortValue}
          onValueChange={(value) => {
            const option = SORT_OPTIONS.find(
              (item) => `${item.orderBy}:${item.sort}` === value,
            )
            if (option) props.onSort(option.orderBy, option.sort)
          }}
        >
          <SelectTrigger
            aria-label={t("並び順", "Sort")}
            className={cn(selectClassName, "col-span-2 md:col-span-1")}
          >
            <SelectValue placeholder={t("並び順", "Sort")} />
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
          value={props.workType ?? "ALL"}
          onValueChange={(value) =>
            props.setWorkType(
              value === "ALL" ? null : (value as IntrospectionEnum<"WorkType">),
            )
          }
        >
          <SelectTrigger
            aria-label={t("種類", "Type")}
            className={selectClassName}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">
              {t("すべての種類", "All types")}
            </SelectItem>
            <SelectItem value="WORK">{t("画像", "Image")}</SelectItem>
            <SelectItem value="VIDEO">{t("動画", "Video")}</SelectItem>
            <SelectItem value="NOVEL">{t("小説", "Novel")}</SelectItem>
            <SelectItem value="COLUMN">{t("コラム", "Column")}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={props.rating ?? "ALL"}
          onValueChange={(value) =>
            props.setRating(
              value === "ALL" ? null : (value as IntrospectionEnum<"Rating">),
            )
          }
        >
          <SelectTrigger
            aria-label={t("年齢制限", "Rating")}
            className={selectClassName}
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

        <Select
          value={String(props.perPage)}
          onValueChange={(value) =>
            props.onClickPerPageChange(Number.parseInt(value, 10))
          }
        >
          <SelectTrigger
            aria-label={t("表示件数", "Per page")}
            className={cn(selectClassName, "hidden md:flex")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 30, 50, 100].map((count) => (
              <SelectItem key={count} value={String(count)}>
                {t(`${count}件ずつ`, `${count} per page`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {props.isFiltered && (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-muted-foreground text-xs"
          onClick={props.onClearFilters}
        >
          <XIcon className="mr-1 size-3.5" />
          {t("絞り込みをすべて解除", "Clear all filters")}
        </Button>
      )}
    </div>
  )
}
