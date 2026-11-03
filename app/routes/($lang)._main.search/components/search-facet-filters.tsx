import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
import { FilterButton } from "~/routes/($lang)._main.search/components/search-filter-button"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import type { SearchFilterChange } from "~/routes/($lang)._main.search/utils/search-filters"

/**
 * スタイル、年齢指定、プロンプトの絞り込み
 */
export function SearchFacetFilters(props: {
  data: SearchLoaderData
  navigateToSearch: (tagName?: string | null, next?: SearchFilterChange) => void
}) {
  const t = useTranslation()
  const { data, navigateToSearch } = props

  return (
    <div className="mb-6 flex flex-col gap-5 md:mb-8">
      <div
        className={cn(
          "flex flex-wrap items-center gap-6 pb-1",
          data.mode === "text" && "hidden",
        )}
      >
        {(
          [
            ["all", t("すべて", "All")],
            ["ILLUSTRATION", t("AIイラスト", "AI Illustration")],
            ["REAL", t("AIフォト", "AI Photo")],
          ] as const
        ).map(([value, label]) => (
          <FilterButton
            key={value}
            isActive={data.filters.style === value}
            onClick={() => {
              navigateToSearch(data.searchQuery, { style: value })
            }}
          >
            {label}
          </FilterButton>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="order-1 flex flex-wrap gap-2 md:order-2 md:justify-end">
          {(
            [
              ["G", t("全年齢", "All ages")],
              ["R15", "R-15"],
              ["R18", "R-18"],
            ] as const
          ).map(([value, label]) => (
            <FilterButton
              key={value}
              variant="pill"
              isActive={data.filters.rating === value}
              onClick={() => {
                navigateToSearch(data.searchQuery, { rating: value })
              }}
            >
              {label}
            </FilterButton>
          ))}
        </div>

        <div
          className={cn(
            "order-2 flex flex-wrap gap-0 md:order-1",
            data.mode === "text" && "invisible",
          )}
        >
          {(
            [
              ["all", t("すべて", "All")],
              ["with", t("プロンプトあり", "With prompt")],
              ["without", t("プロンプトなし", "Without prompt")],
            ] as const
          ).map(([value, label], index) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                navigateToSearch(data.searchQuery, { prompt: value })
              }}
              className={cn(
                "border px-4 py-3 text-sm transition-colors md:text-base",
                index === 0 ? "rounded-l-md" : "",
                index === 2 ? "rounded-r-md" : "",
                index > 0 ? "-ml-px" : "",
                data.filters.prompt === value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
