import {
  appFilterChipClassName,
  appPillRowClassName,
} from "~/components/app/app-pill-tab"
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
        className={cn(appPillRowClassName, data.mode === "text" && "hidden")}
      >
        {(
          [
            ["all", t("すべて", "All")],
            ["ILLUSTRATION", t("AIイラスト", "AI Illustration")],
            ["REAL", t("AIフォト", "AI Photo")],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={data.filters.style === value}
            onClick={() => {
              navigateToSearch(data.searchQuery, { style: value })
            }}
            className={appFilterChipClassName(data.filters.style === value)}
          >
            {label}
          </button>
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
            "order-2 md:order-1",
            appPillRowClassName,
            data.mode === "text" && "invisible",
          )}
        >
          {(
            [
              ["all", t("すべて", "All")],
              ["with", t("プロンプトあり", "With prompt")],
              ["without", t("プロンプトなし", "Without prompt")],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={data.filters.prompt === value}
              onClick={() => {
                navigateToSearch(data.searchQuery, { prompt: value })
              }}
              className={appFilterChipClassName(data.filters.prompt === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
