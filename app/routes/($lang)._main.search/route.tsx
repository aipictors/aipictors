import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import { Link, useLoaderData, useLocation, useNavigate } from "@remix-run/react"
import { graphql } from "gql.tada"
import { Heart, SearchIcon } from "lucide-react"
import { type FormEvent, useEffect, useState } from "react"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { LikeButton } from "~/components/like-button"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { SearchRateLimitDialog } from "~/components/search/search-rate-limit-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { config } from "~/config"
import { useSearchRateLimit } from "~/hooks/use-search-rate-limit"
import { useTranslation } from "~/hooks/use-translation"
import { loaderClient } from "~/lib/loader-client"
import { cn } from "~/lib/utils"
import { buildSearchPath } from "~/utils/search-route"
import { withIconUrlFallback } from "~/utils/with-icon-url-fallback"

type SearchRatingFilter = "G" | "R15" | "R18"
type SearchStyleFilter = "all" | "ILLUSTRATION" | "REAL"
type SearchPromptFilter = "all" | "with" | "without"

const RESULTS_LIMIT = 30
const SIDEBAR_RANKING_LIMIT = 7

const normalizeTagQuery = (value?: string | null) => {
  if (!value) {
    return null
  }

  const normalized = value.trim().replace(/^#+/, "")
  return normalized.length > 0 ? normalized : null
}

const getRatingFilter = (
  value: string | null,
  isSensitiveMode: boolean,
): SearchRatingFilter => {
  if (value === "G" || value === "R15" || value === "R18") {
    return value
  }

  return isSensitiveMode ? "R18" : "G"
}

const getStyleFilter = (value: string | null): SearchStyleFilter => {
  if (value === "ILLUSTRATION" || value === "REAL") {
    return value
  }

  return "all"
}

const getPromptFilter = (value: string | null): SearchPromptFilter => {
  if (value === "with" || value === "without") {
    return value
  }

  return "all"
}

const getCurrentPage = (value: string | null) => {
  const parsed = Number(value ?? "0")

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0
  }

  return Math.floor(parsed)
}

const buildWorksWhere = (props: {
  tagQuery?: string | null
  rating: SearchRatingFilter
  style: SearchStyleFilter
  prompt: SearchPromptFilter
}) => {
  const where: Record<string, unknown> = {
    ratings: [props.rating],
    orderBy: "LIKES_COUNT",
    sort: "DESC",
  }

  if (props.tagQuery) {
    where.tagNames = [props.tagQuery]
  }

  if (props.style !== "all") {
    where.style = props.style
  }

  if (props.prompt === "with") {
    where.hasPrompt = true
    where.isPromptPublic = true
  }

  if (props.prompt === "without") {
    where.isPromptPublic = false
  }

  return where
}

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const isSensitiveMode = url.pathname.startsWith("/r/")
  const basePath = isSensitiveMode ? "/r/search" : "/search"
  const pathSearchQuery = props.params.q
    ? decodeURIComponent(props.params.q)
    : null
  const searchQuery = normalizeTagQuery(
    pathSearchQuery ?? url.searchParams.get("tag") ?? url.searchParams.get("q"),
  )
  const currentPage = getCurrentPage(url.searchParams.get("page"))
  const rating = getRatingFilter(
    url.searchParams.get("age_limit") ?? url.searchParams.get("rating"),
    isSensitiveMode,
  )
  const style = getStyleFilter(url.searchParams.get("style"))
  const prompt = getPromptFilter(url.searchParams.get("prompt"))
  const defaultRating = isSensitiveMode ? "R18" : "G"

  if (
    pathSearchQuery !== null ||
    url.searchParams.has("q") ||
    url.searchParams.has("rating") ||
    (searchQuery !== null && !url.searchParams.has("age_limit")) ||
    url.searchParams.get("page") === "0"
  ) {
    const nextSearchParams = new URLSearchParams(url.searchParams)

    nextSearchParams.delete("q")
    nextSearchParams.delete("rating")
    nextSearchParams.set("age_limit", rating === defaultRating ? "" : rating)

    if (currentPage > 0) {
      nextSearchParams.set("page", String(currentPage))
    } else {
      nextSearchParams.delete("page")
    }

    return redirect(
      buildSearchPath(searchQuery, nextSearchParams, { basePath }),
    )
  }

  const resultWhere = buildWorksWhere({
    tagQuery: searchQuery,
    rating,
    style,
    prompt,
  })
  const rankingWhere = buildWorksWhere({
    rating,
    style,
    prompt,
  })

  const [popularTagsResp, rankingResp, worksResp, worksCountResp] =
    await Promise.all([
      loaderClient.query({
        query: popularTagsQuery,
        variables: {
          limit: 10,
          where: { isSensitive: isSensitiveMode },
        },
      }),
      loaderClient.query({
        query: worksQuery,
        variables: {
          offset: 0,
          limit: SIDEBAR_RANKING_LIMIT,
          where: rankingWhere,
        },
      }),
      searchQuery
        ? loaderClient.query({
            query: worksQuery,
            variables: {
              offset: currentPage * RESULTS_LIMIT,
              limit: RESULTS_LIMIT,
              where: resultWhere,
            },
          })
        : Promise.resolve(null),
      searchQuery
        ? loaderClient.query({
            query: worksCountQuery,
            variables: { where: resultWhere },
          })
        : Promise.resolve(null),
    ])

  return {
    filters: {
      prompt,
      rating,
      style,
    },
    currentPage,
    isSensitiveMode,
    popularTags:
      popularTagsResp.data?.recommendedTags?.map((tag) => ({
        name: tag.tagName,
        thumbnailUrl: tag.thumbnailUrl,
      })) ?? [],
    rankingWorks: rankingResp.data?.works ?? [],
    searchQuery,
    works: worksResp?.data?.works ?? [],
    worksCount: worksCountResp?.data?.worksCount ?? 0,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneHour,
})

function FilterButton(props: {
  children: React.ReactNode
  isActive: boolean
  onClick: () => void
  variant?: "underline" | "pill"
}) {
  if (props.variant === "pill") {
    return (
      <button
        type="button"
        onClick={props.onClick}
        className={cn(
          "rounded-sm border px-4 py-2 text-sm transition-colors",
          props.isActive
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-background text-muted-foreground hover:text-foreground",
        )}
      >
        {props.children}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "border-b-2 px-1 pb-3 font-medium text-base transition-colors md:text-lg",
        props.isActive
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {props.children}
    </button>
  )
}

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

  const basePath = location.pathname.startsWith("/r/") ? "/r/search" : "/search"

  const buildFilterParams = (
    next?: Partial<typeof data.filters> & { page?: number },
  ) => {
    const params = new URLSearchParams()
    const rating = next?.rating ?? data.filters.rating
    const style = next?.style ?? data.filters.style
    const prompt = next?.prompt ?? data.filters.prompt
    const page = next?.page ?? 0

    params.set(
      "age_limit",
      rating === (data.isSensitiveMode ? "R18" : "G") ? "" : rating,
    )

    if (style !== "all") {
      params.set("style", style)
    }

    if (prompt !== "all") {
      params.set("prompt", prompt)
    }

    if (page > 0) {
      params.set("page", String(page))
    }

    return params
  }

  const navigateToSearch = (
    tagName?: string | null,
    next?: Partial<typeof data.filters> & { page?: number },
  ) => {
    const normalizedQuery = normalizeTagQuery(tagName)
    const nextParams = buildFilterParams(next)

    executeSearchWithRateLimit(() => {
      navigate(buildSearchPath(normalizedQuery, nextParams, { basePath }))
    })
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigateToSearch(searchText)
  }

  const hasResults = data.searchQuery !== null

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
              placeholder={t("タグ名を入力", "Enter tag name")}
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
          <main className="min-w-0">
            <div className="mb-7 border-b pb-4 md:pb-5">
              <div>
                <h1 className="font-bold text-3xl leading-none md:text-4xl">
                  {data.searchQuery
                    ? `#${data.searchQuery}`
                    : t("タグ検索", "Tag Search")}
                </h1>
                <p className="mt-4 font-semibold text-xl md:text-2xl">
                  <span className="text-foreground/80">
                    {data.searchQuery
                      ? t(`${data.worksCount}件`, `${data.worksCount} works`)
                      : t(
                          "検索したいタグを入力してください",
                          "Enter a tag to start searching",
                        )}
                  </span>
                </p>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-5 md:mb-8">
              <div className="flex flex-wrap items-center gap-6 border-b pb-1">
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

                <div className="order-2 flex flex-wrap gap-0 md:order-1">
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

            {hasResults ? (
              data.works.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-7 md:gap-x-5 md:gap-y-8 lg:grid-cols-4 xl:grid-cols-5">
                    {data.works.map((work) => (
                      <article key={work.id} className="min-w-0">
                        <div className="group relative">
                          <CroppedWorkSquare
                            workId={work.id}
                            imageUrl={work.smallThumbnailImageURL}
                            thumbnailImagePosition={
                              work.thumbnailImagePosition ?? 0
                            }
                            size="auto"
                            imageWidth={work.smallThumbnailImageWidth}
                            imageHeight={work.smallThumbnailImageHeight}
                            subWorksCount={work.subWorksCount}
                            commentsCount={work.commentsCount}
                            isPromptPublic={
                              work.promptAccessType === "PUBLIC" ||
                              work.isGeneration
                            }
                            hasVideoUrl={Boolean(work.url)}
                            isGeneration={work.isGeneration}
                          />

                          <div className="absolute right-2 bottom-2 z-10">
                            <LikeButton
                              size={48}
                              targetWorkId={work.id}
                              targetWorkOwnerUserId={work.user?.id ?? ""}
                              defaultLiked={work.isLiked}
                              defaultLikedCount={0}
                              likedCount={work.likesCount}
                              isBackgroundNone={true}
                              strokeWidth={2}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-start justify-between gap-3">
                          <Link
                            to={`/posts/${work.id}`}
                            className="line-clamp-2 flex-1 font-bold text-[clamp(1.25rem,2vw,1.6rem)] leading-snug hover:underline md:text-lg"
                          >
                            {work.title}
                          </Link>

                          <div className="flex shrink-0 items-center gap-1 text-muted-foreground text-sm">
                            <Heart className="size-4" />
                            <span>{work.likesCount}</span>
                          </div>
                        </div>

                        {work.user && (
                          <Link
                            to={`/users/${work.user.id}`}
                            className="mt-2 flex items-center gap-2"
                          >
                            <Avatar className="size-9">
                              <AvatarImage
                                src={withIconUrlFallback(work.user.iconUrl)}
                                alt={work.user.name}
                              />
                              <AvatarFallback>
                                {work.user.name.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-base md:text-lg">
                              {work.user.name}
                            </span>
                          </Link>
                        )}
                      </article>
                    ))}
                  </div>

                  {data.worksCount > RESULTS_LIMIT && (
                    <div className="mt-10 flex justify-center">
                      <ResponsivePagination
                        maxCount={data.worksCount}
                        perPage={RESULTS_LIMIT}
                        currentPage={data.currentPage}
                        onPageChange={(page) => {
                          navigateToSearch(data.searchQuery, { page })
                        }}
                        isActiveButtonStyle
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-md border bg-muted/20 px-6 py-16 text-center">
                  <p className="text-lg text-muted-foreground">
                    {t(
                      "該当する作品が見つかりませんでした",
                      "No works were found",
                    )}
                  </p>
                </div>
              )
            ) : (
              <div className="rounded-md border bg-muted/20 px-6 py-16 text-center">
                <p className="text-lg text-muted-foreground">
                  {t(
                    "検索したいタグを入力してください",
                    "Enter a tag to start searching",
                  )}
                </p>
              </div>
            )}
          </main>

          <aside className="hidden space-y-10 xl:block">
            <section>
              <h2 className="mb-6 font-bold text-3xl">
                {t("人気のイラストタグ", "Popular Illustration Tags")}
              </h2>
              <div className="space-y-4 text-xl leading-relaxed">
                {data.popularTags.map((tag) => (
                  <button
                    key={tag.name}
                    type="button"
                    className="block text-left font-semibold transition-colors hover:text-primary"
                    onClick={() => {
                      navigateToSearch(tag.name)
                    }}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-6 font-bold text-3xl">
                {t("人気ランキング", "Popular Ranking")}
              </h2>
              <div className="space-y-4">
                {data.rankingWorks.map((work, index) => (
                  <Link
                    key={work.id}
                    to={`/posts/${work.id}`}
                    className="flex items-start gap-3"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center bg-orange-400 font-bold text-2xl text-black">
                      {index + 1}
                    </div>

                    <img
                      src={work.smallThumbnailImageURL}
                      alt={work.title}
                      className="size-[72px] shrink-0 object-cover"
                    />

                    <div className="min-w-0">
                      <p className="line-clamp-2 font-semibold text-lg leading-snug">
                        {work.title}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-base text-muted-foreground">
                        <Avatar className="size-7">
                          <AvatarImage
                            src={withIconUrlFallback(work.user?.iconUrl)}
                            alt={work.user?.name ?? ""}
                          />
                          <AvatarFallback>
                            {work.user?.name?.slice(0, 1) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{work.user?.name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
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

  const title = searchQuery
    ? `#${searchQuery} の作品検索 - Aipictors`
    : "タグ検索 - Aipictors"
  const description = searchQuery
    ? `#${searchQuery} のタグで投稿された作品を一覧表示します。`
    : "タグで作品を検索できます。人気タグやランキングもあわせて確認できます。"

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    {
      name: "robots",
      content: searchQuery ? "noindex, follow" : "index, follow",
    },
  ]
}

const worksQuery = graphql(
  `query SearchTagWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const worksCountQuery = graphql(
  `query SearchTagWorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

const popularTagsQuery = graphql(
  `query SearchPopularTags($limit: Int!, $where: RecommendedTagsWhereInput!) {
    recommendedTags(limit: $limit, where: $where) {
      tagName
      thumbnailUrl
    }
  }`,
)
