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

  const textCount =
    props.textWorksCount >= TEXT_SEARCH_COUNT_LIMIT
      ? `${TEXT_SEARCH_COUNT_LIMIT.toLocaleString()}+`
      : props.textWorksCount.toLocaleString()

  // アプリと同じ 2 つの区切り。上に名前、下に件数（どこから探すか）
  const segments = [
    {
      mode: "tag",
      label: t(`タグ「${data.searchQuery}」`, `Tag "${data.searchQuery}"`),
      caption: t(
        `${data.tagWorksCount.toLocaleString()}件`,
        `${data.tagWorksCount.toLocaleString()} works`,
      ),
    },
    {
      mode: "text",
      label: t("キーワード", "Keyword"),
      caption: t(`タイトル・説明から ${textCount}件`, `In titles ${textCount}`),
    },
  ] as const

  return (
    <div
      role="tablist"
      aria-label={t("検索の種類", "Search type")}
      className="mb-3 flex gap-1 rounded-[15px] bg-muted p-1 md:max-w-xl"
    >
      {segments.map((segment) => {
        const isActive = data.mode === segment.mode
        return (
          <button
            key={segment.mode}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              if (!isActive) {
                navigateToSearch(data.searchQuery, { mode: segment.mode })
              }
            }}
            className={cn(
              "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-2.5 py-1.5 transition-colors",
              isActive
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="max-w-full truncate font-extrabold text-[13px]">
              {segment.label}
            </span>
            <span className="max-w-full truncate font-semibold text-[11px] text-muted-foreground tabular-nums">
              {segment.caption}
            </span>
          </button>
        )
      })}
    </div>
  )
}
