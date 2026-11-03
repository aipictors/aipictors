import { ChevronRightIcon } from "lucide-react"
import { useTranslation } from "~/hooks/use-translation"
import { Link } from "~/lib/app/locale-router"
import { TEXT_SEARCH_COUNT_LIMIT } from "~/lib/work-text-search-constants"
import type { SearchLoaderData } from "~/routes/($lang)._main.search/search-loader.server"
import type { SearchFilterChange } from "~/routes/($lang)._main.search/utils/search-filters"

/**
 * 検索の見出し、件数、関連タグ
 */
export function SearchPageHeader(props: {
  data: SearchLoaderData
  navigateToSearch: (tagName?: string | null, next?: SearchFilterChange) => void
  pagePrefix: string
}) {
  const t = useTranslation()
  const { data, navigateToSearch, pagePrefix } = props

  return (
    <div className="mb-7 pb-4 md:pb-5">
      <div>
        <h1 className="break-words font-bold text-2xl leading-tight md:text-3xl">
          {data.searchQuery
            ? `#${data.searchQuery}`
            : data.isSensitiveMode
              ? t("R18 作品検索", "R18 search")
              : t("作品検索", "Search")}
        </h1>
        <p className="mt-3 text-muted-foreground text-sm md:text-base">
          {data.searchQuery
            ? t(
                data.mode === "text"
                  ? `タイトル・説明に「${data.searchQuery}」を含む作品 ${
                      data.worksCount >= TEXT_SEARCH_COUNT_LIMIT
                        ? `${TEXT_SEARCH_COUNT_LIMIT.toLocaleString()}件以上`
                        : `${data.worksCount.toLocaleString()}件`
                    }`
                  : `タグ「${data.searchQuery}」の作品 ${data.worksCount.toLocaleString()}件`,
                `${data.worksCount.toLocaleString()} works`,
              )
            : t(
                "キーワードを入力するか、人気のタグから選んでください",
                "Enter a tag name or pick a popular tag",
              )}
        </p>
        {data.searchQuery && (
          <Link
            to={`${pagePrefix}/tags/${encodeURIComponent(data.searchQuery)}`}
            className="mt-3 inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 font-medium text-sm transition-colors hover:bg-muted"
          >
            {t(
              `#${data.searchQuery} のタグページを見る`,
              `Open the #${data.searchQuery} tag page`,
            )}
            <ChevronRightIcon className="size-4" />
          </Link>
        )}
      </div>
      {data.relatedTags.length > 0 && (
        <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {data.relatedTags.map((tagName) => (
            <button
              key={tagName}
              type="button"
              onClick={() => navigateToSearch(tagName)}
              className="inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border bg-background px-3 text-muted-foreground text-sm transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              #{tagName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
