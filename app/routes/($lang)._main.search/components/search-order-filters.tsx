import { useContext } from "react"
import {
  appFilterChipClassName,
  appPillRowClassName,
} from "~/components/app/app-pill-tab"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import type { SearchFilterChange } from "~/routes/($lang)._main.search/utils/search-filters"

/**
 * 並び順と「自分の作品のみ」
 */
export function SearchOrderFilters(props: {
  data: SearchLoaderData
  navigateToSearch: (tagName?: string | null, next?: SearchFilterChange) => void
}) {
  const t = useTranslation()
  const authContext = useContext(AuthContext)
  const { data, navigateToSearch } = props

  return (
    <div className={`mb-5 items-center ${appPillRowClassName}`}>
      <div
        role="group"
        aria-label={t("並び順", "Sort order")}
        className="flex shrink-0 gap-2"
      >
        {(
          [
            ["popular", t("人気順", "Popular")],
            ["new", t("新しい順", "Newest")],
            ["old", t("古い順", "Oldest")],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={data.filters.order === value}
            onClick={() => {
              navigateToSearch(data.searchQuery, { order: value })
            }}
            className={appFilterChipClassName(data.filters.order === value)}
          >
            {label}
          </button>
        ))}
      </div>

      {(authContext.userId || data.filters.userId) && (
        <button
          type="button"
          aria-pressed={data.filters.userId !== null}
          onClick={() => {
            navigateToSearch(data.searchQuery, {
              userId: data.filters.userId ? null : authContext.userId,
            })
          }}
          className={appFilterChipClassName(data.filters.userId !== null)}
        >
          {t("自分の作品のみ", "My works only")}
        </button>
      )}
    </div>
  )
}
