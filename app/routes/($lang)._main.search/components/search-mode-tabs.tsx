import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { TEXT_SEARCH_COUNT_LIMIT } from "~/lib/work-text-search-constants"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import type { SearchFilterChange } from "~/routes/($lang)._main.search/utils/search-filters"

/**
 * 「キーワードを含む」「タグが一致」の切り替え
 */
export function SearchModeTabs(props: {
  data: SearchLoaderData
  navigateToSearch: (tagName?: string | null, next?: SearchFilterChange) => void
  textWorksCount: number
}) {
  const t = useTranslation()
  const { data, navigateToSearch } = props

  return (
    <div
      role="tablist"
      aria-label={t("検索の種類", "Search type")}
      className="mb-5 flex gap-1 rounded-full bg-muted p-1 sm:inline-flex"
    >
      {(
        [
          [
            "text",
            t("キーワードを含む", "Contains keyword"),
            props.textWorksCount >= TEXT_SEARCH_COUNT_LIMIT
              ? `${TEXT_SEARCH_COUNT_LIMIT.toLocaleString()}+`
              : props.textWorksCount.toLocaleString(),
          ],
          [
            "tag",
            t("タグが一致", "Exact tag"),
            data.tagWorksCount.toLocaleString(),
          ],
        ] as const
      ).map(([mode, label, count]) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={data.mode === mode}
          onClick={() => navigateToSearch(data.searchQuery, { mode })}
          className={cn(
            "flex-1 whitespace-nowrap rounded-full px-4 py-2 font-medium text-sm transition-colors sm:flex-none",
            data.mode === mode
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
          <span className="ml-1.5 text-muted-foreground text-xs tabular-nums">
            {count}
          </span>
        </button>
      ))}
    </div>
  )
}
