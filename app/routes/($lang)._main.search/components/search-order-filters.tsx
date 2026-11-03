import { useContext } from "react"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { cn } from "~/lib/utils"
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
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label={t("並び順", "Sort order")}
        className="flex rounded-full bg-muted p-1"
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
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium text-sm transition-colors",
              data.filters.order === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
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
          className={cn(
            "h-9 whitespace-nowrap rounded-full border px-3.5 font-medium text-sm transition-colors",
            data.filters.userId
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {t("自分の作品のみ", "My works only")}
        </button>
      )}
    </div>
  )
}
