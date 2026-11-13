import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import {
  type ShouldRevalidateFunction,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "@remix-run/react"
import { SearchIcon } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { SearchRateLimitDialog } from "~/components/search/search-rate-limit-dialog"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config } from "~/config"
import { useSearchRateLimit } from "~/hooks/use-search-rate-limit"
import { useTranslation } from "~/hooks/use-translation"
import { Link, useNavigate } from "~/lib/app/locale-router"
import { SearchFacetFilters } from "~/routes/($lang)._main.search/components/search-facet-filters"
import { SearchModeTabs } from "~/routes/($lang)._main.search/components/search-mode-tabs"
import { SearchOrderFilters } from "~/routes/($lang)._main.search/components/search-order-filters"
import { SearchPageHeader } from "~/routes/($lang)._main.search/components/search-page-header"
import { SearchResults } from "~/routes/($lang)._main.search/components/search-results"
import { SearchSidebar } from "~/routes/($lang)._main.search/components/search-sidebar"
import { SearchTagsPanel } from "~/routes/($lang)._main.search/components/search-tags-panel"
import { SearchTypeTabs } from "~/routes/($lang)._main.search/components/search-type-tabs"
import { SearchUsersPanel } from "~/routes/($lang)._main.search/components/search-users-panel"
import { searchLoader } from "~/routes/($lang)._main.search/search-loader.server"
import {
  buildSearchFilterParams,
  getSearchBasePath,
  getSearchType,
  normalizeTagQuery,
  type SearchFilterChange,
  type SearchRatingFilter,
} from "~/routes/($lang)._main.search/utils/search-filters"
import { writeContentMode } from "~/utils/content-mode"
import { buildSearchPath } from "~/utils/search-route"

export async function loader(props: LoaderFunctionArgs) {
  return searchLoader(props)
}

/**
 * 作品・ユーザー・タグの切り替え（?type=）だけのときは読み直さない（ユーザーとタグは画面側で取る）
 */
export const shouldRevalidate: ShouldRevalidateFunction = (props) => {
  if (props.formMethod && props.formMethod !== "GET") {
    return props.defaultShouldRevalidate
  }
  const current = new URLSearchParams(props.currentUrl.search)
  const next = new URLSearchParams(props.nextUrl.search)
  current.delete("type")
  next.delete("type")
  if (
    props.currentUrl.pathname === props.nextUrl.pathname &&
    current.toString() === next.toString()
  ) {
    return false
  }
  return props.defaultShouldRevalidate
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

export default function SearchRoute() {
  const data = useLoaderData<typeof loader>()
  const location = useLocation()
  const navigate = useNavigate()
  const t = useTranslation()
  const [searchParams] = useSearchParams()
  // 言葉がないときは作品の入口（人気のタグなど）だけ出す
  const searchType = data.searchQuery
    ? getSearchType(searchParams.get("type"))
    : "works"
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
    // 別の言葉で探し直すときは、見ているタブ（ユーザー・タグ）のまま
    if (
      searchType !== "works" &&
      (next === undefined || next.rating !== undefined)
    ) {
      nextParams.set("type", searchType)
    }

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
                "作品・ユーザー・タグを検索",
                "Search works, users and tags",
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
            {data.searchQuery && <SearchTypeTabs type={searchType} />}

            {searchType === "users" && data.searchQuery && (
              <SearchUsersPanel
                query={data.searchQuery}
                isSensitiveMode={data.isSensitiveMode}
                pagePrefix={pagePrefix}
              />
            )}

            {searchType === "tags" && data.searchQuery && (
              <SearchTagsPanel
                query={data.searchQuery}
                isSensitiveMode={data.isSensitiveMode}
                pagePrefix={pagePrefix}
              />
            )}

            {searchType === "works" && (
              <>
                <SearchPageHeader
                  data={data}
                  navigateToSearch={navigateToSearch}
                  pagePrefix={pagePrefix}
                />

                <ReadingWorksHint query={data.searchQuery} />

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
              </>
            )}
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

/** 小説・コラムは「小説」タグが付いていない作品が多いので、種類ごとの一覧へ案内する */
const READING_WORKS_HINTS = [
  {
    words: ["小説", "ノベル", "web小説", "novel", "novels"],
    path: "/novels",
    label: ["小説の作品をすべて見る", "See all novels"],
    note: [
      "タグに「小説」が付いていない小説も、こちらにまとめて並んでいます",
      "Includes novels without the tag",
    ],
  },
  {
    words: ["コラム", "column", "columns"],
    path: "/notes",
    label: ["コラムの作品をすべて見る", "See all columns"],
    note: [
      "タグに「コラム」が付いていないコラムも、こちらにまとめて並んでいます",
      "Includes columns without the tag",
    ],
  },
] as const

function ReadingWorksHint(props: { query: string | null }) {
  const t = useTranslation()
  const query = props.query?.trim().toLowerCase()
  if (!query) {
    return null
  }
  const hint = READING_WORKS_HINTS.find((item) =>
    (item.words as readonly string[]).includes(query),
  )
  if (!hint) {
    return null
  }
  return (
    <Link
      to={hint.path}
      className="mb-4 flex items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm transition-colors hover:bg-muted"
    >
      <span className="min-w-0">
        <span className="block font-bold">
          {t(hint.label[0], hint.label[1])}
        </span>
        <span className="block text-muted-foreground text-xs">
          {t(hint.note[0], hint.note[1])}
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 text-muted-foreground">
        →
      </span>
    </Link>
  )
}
