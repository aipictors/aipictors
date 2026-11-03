import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useLocation } from "@remix-run/react"
import { SearchIcon } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { SearchRateLimitDialog } from "~/components/search/search-rate-limit-dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config } from "~/config"
import { useSearchRateLimit } from "~/hooks/use-search-rate-limit"
import { useTranslation } from "~/hooks/use-translation"
import { useNavigate } from "~/lib/app/locale-router"
import { SearchFacetFilters } from "~/routes/($lang)._main.search/components/search-facet-filters"
import { SearchModeTabs } from "~/routes/($lang)._main.search/components/search-mode-tabs"
import { SearchOrderFilters } from "~/routes/($lang)._main.search/components/search-order-filters"
import { SearchPageHeader } from "~/routes/($lang)._main.search/components/search-page-header"
import { SearchResults } from "~/routes/($lang)._main.search/components/search-results"
import { SearchSidebar } from "~/routes/($lang)._main.search/components/search-sidebar"
import { searchLoader } from "~/routes/($lang)._main.search/search-loader.server"
import {
  buildSearchFilterParams,
  getSearchBasePath,
  normalizeTagQuery,
  type SearchFilterChange,
  type SearchRatingFilter,
} from "~/routes/($lang)._main.search/utils/search-filters"
import { writeContentMode } from "~/utils/content-mode"
import { buildSearchPath } from "~/utils/search-route"

export async function loader(props: LoaderFunctionArgs) {
  return searchLoader(props)
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SearchRoute() {
  const data = useLoaderData<typeof loader>()
  const location = useLocation()
  const navigate = useNavigate()
  const t = useTranslation()
  const {
    isRateLimitDialogOpen,
    executeSearchWithRateLimit,
    closeSearchRateLimitDialog,
  } = useSearchRateLimit()
  const [searchText, setSearchText] = useState(data.searchQuery ?? "")

  useEffect(() => {
    setSearchText(data.searchQuery ?? "")
  }, [data.searchQuery])

  // 作品・ユーザー・タグへのリンク（R18 の検索からは R18 のページへ）
  const pagePrefix = data.isSensitiveMode ? "/r" : ""

  const navigateToSearch = (
    tagName?: string | null,
    next?: SearchFilterChange,
  ) => {
    const normalizedQuery = normalizeTagQuery(tagName)
    // 新しい言葉で検索するときは、タグ・タイトルのどちらを出すか自動で決める
    const nextParams = buildSearchFilterParams(
      data,
      normalizedQuery !== data.searchQuery && next?.mode === undefined
        ? { ...next, mode: null }
        : next,
    )

    const nextRating = next?.rating ?? data.filters.rating
    const basePath = getSearchBasePath(
      location.pathname,
      nextRating === "R18" ? "R18" : "all",
    )

    executeSearchWithRateLimit(() => {
      // ここで R18 を選ぶ・外すのは、ヘッダーの切り替えと同じ意味にする
      writeContentMode(nextRating === "R18" ? "r18" : "all")
      navigate(buildSearchPath(normalizedQuery, nextParams, { basePath }))
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigateToSearch(searchText)
  }

  return (
    <>
      <div className="mx-auto max-w-[1480px] px-3 py-5 md:px-6 md:py-6 lg:px-8">
        <form
          onSubmit={handleSubmit}
          className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center"
        >
          <label className="sr-only" htmlFor="search-rating-select">
            {t("年齢指定", "Age rating")}
          </label>
          <select
            id="search-rating-select"
            className="h-12 rounded-md border bg-background px-4 text-sm lg:w-40"
            value={data.filters.rating}
            onChange={(event) => {
              navigateToSearch(data.searchQuery, {
                rating: event.target.value as SearchRatingFilter,
              })
            }}
          >
            <option value="G">{t("全年齢", "All ages")}</option>
            <option value="R15">R-15</option>
            <option value="R18">R-18</option>
          </select>

          <div className="flex flex-1 items-center overflow-hidden rounded-md border bg-background">
            <Input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t(
                "タグ・タイトル・説明で検索",
                "Search tags, titles and descriptions",
              )}
              className="h-12 border-0 text-base shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              className="mr-1 size-10 shrink-0"
              aria-label={t("検索", "Search")}
            >
              <SearchIcon className="size-5" />
            </Button>
          </div>
        </form>

        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_280px] 2xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <SearchPageHeader
              data={data}
              navigateToSearch={navigateToSearch}
              pagePrefix={pagePrefix}
            />

            {data.searchQuery && data.textWorksCount !== null && (
              <SearchModeTabs
                data={data}
                navigateToSearch={navigateToSearch}
                textWorksCount={data.textWorksCount}
              />
            )}

            {data.searchQuery && (
              <SearchOrderFilters
                data={data}
                navigateToSearch={navigateToSearch}
              />
            )}

            <SearchFacetFilters
              data={data}
              navigateToSearch={navigateToSearch}
            />

            <SearchResults
              data={data}
              navigateToSearch={navigateToSearch}
              pagePrefix={pagePrefix}
            />
          </div>

          <SearchSidebar data={data} pagePrefix={pagePrefix} />
        </div>
      </div>

      <SearchRateLimitDialog
        isOpen={isRateLimitDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeSearchRateLimitDialog()
          }
        }}
      />
    </>
  )
}

export const meta: MetaFunction<typeof loader> = (props) => {
  const searchQuery = props.data?.searchQuery ?? ""
  const isSensitiveMode = props.data?.isSensitiveMode ?? false

  const isEn = props.params.lang === "en"
  const title = isEn
    ? searchQuery
      ? `${isSensitiveMode ? "R18 " : ""}Search results for "${searchQuery}" - Aipictors`
      : `Search ${isSensitiveMode ? "R18 " : ""}AI art by tag, title and description - Aipictors`
    : searchQuery
      ? `「${searchQuery}」の${isSensitiveMode ? "R18 " : ""}検索結果 - Aipictors`
      : `${isSensitiveMode ? "R18 " : ""}作品検索（タグ・タイトル・説明） - Aipictors`
  const description = isEn
    ? searchQuery
      ? `Works tagged #${searchQuery} on Aipictors.`
      : "Search AI illustrations by tag, title and description. See popular tags and rankings too."
    : searchQuery
      ? `#${searchQuery} のタグで投稿された作品を一覧表示します。`
      : "AIイラストをタグ・タイトル・説明から検索できます。人気のタグやランキングもあわせて確認できます。"

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:image", content: config.defaultOgpImageUrl },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: config.defaultOgpImageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    {
      name: "robots",
      content:
        searchQuery || isSensitiveMode ? "noindex, follow" : "index, follow",
    },
    ...(isSensitiveMode ? [{ name: "rating", content: "adult" }] : []),
  ]
}
