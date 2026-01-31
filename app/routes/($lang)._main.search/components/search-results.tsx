import { useQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { useSearchParams, useNavigate, useLocation } from "@remix-run/react"
import { useState, useEffect, useMemo, useCallback, useContext, useRef } from "react"
import {
  ResponsivePhotoWorksAlbum,
  PhotoAlbumWorkFragment,
} from "~/components/responsive-photo-works-album"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useTranslation } from "~/hooks/use-translation"
import { AuthContext } from "~/contexts/auth-context"
import {
  CompactFilter,
  type FilterValues,
  type AiModel,
} from "~/components/compact-filter"
import { format } from "date-fns"
import { Badge } from "~/components/ui/badge"
import { Loader2, Eye, List, X, Grid } from "lucide-react"
import { Button } from "~/components/ui/button"
import { WorkViewerDialog } from "~/components/work/work-viewer-dialog"
import type { SortType } from "~/types/sort-type"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { SearchWorksSortableSetting } from "./search-works-sortable-setting"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"
import { useInfiniteScroll } from "~/routes/($lang)._main._index/hooks/use-infinite-scroll"
import { usePagedInfinite } from "~/routes/($lang)._main._index/hooks/use-paged-infinite"

const PER_PAGE = 32

const SearchWorksQuery = graphql(
  `query SearchWorks($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PhotoAlbumWork
    }
  }`,
  [PhotoAlbumWorkFragment],
)

const SearchWorksCountQuery = graphql(
  `query SearchWorksCount($where: WorksWhereInput) {
    worksCount(where: $where)
  }`,
)

type Props = {
  initialWorks?: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  models?: AiModel[]
  showLatestWorks?: boolean
  /**
   * explore: 探索トップ用（検索窓＋即グリッドを主役にする）
   * default: 従来の検索結果UI
   */
  mode?: "default" | "explore"
}

export const SearchResults = ({
  initialWorks = [],
  models = [],
  showLatestWorks = false,
  mode = "default",
}: Props) => {
  const t = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useContext(AuthContext)
  const authContext = useContext(AuthContext)

  // Work dialog URL state management
  const workDialog = useWorkDialogUrl()

  // State for dialog mode
  const [isDialogMode, setIsDialogMode] = useState(false)

  // View mode state
  const [viewMode, setViewMode] = useState<"pagination" | "infinite">(
    "pagination",
  )

  // Infinite scroll state
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Read URL parameters
  const currentPage = Math.max(0, Number(searchParams.get("page") || "0"))
  const searchWordsParam = searchParams.get("q") || ""
  const searchWords = searchWordsParam.split(",").filter(Boolean)
  const ratingParam = searchParams.get("rating") || ""
  const ratings = ratingParam.split(",").filter(Boolean)
  const periodParam = searchParams.get("period") || ""
  const modelParam =
    searchParams.get("workModelId") || searchParams.get("model") || ""
  const periodRange = periodParam.split(",").filter(Boolean)
  const navigateToTagPage = searchParams.get("navigateToTagPage") === "true"
  const dialogModeParam = searchParams.get("dialogMode") === "true"
  const viewModeParam = searchParams.get("viewMode") || "pagination"
  const promptPublicParam = searchParams.get("promptPublic") || "all"
  const myWorksOnlyParam = searchParams.get("myWorksOnly") === "true"
  const isOneWorkPerUserParam = searchParams.get("isOneWorkPerUser") === "true"
  const aiUsageParam = searchParams.get("aiUsage") || "all"
  const dateFromParam = searchParams.get("dateFrom")
  const dateToParam = searchParams.get("dateTo")
  const sortParam = searchParams.get("sort") || "DESC"
  const orderByParam =
    searchParams.get("orderBy") ||
    (showLatestWorks ? "DATE_CREATED" : "LIKES_COUNT")

  const isExplore = mode === "explore"
  const hasAnyUserSearch = Boolean(
    searchWordsParam ||
      ratingParam ||
      periodParam ||
      modelParam ||
      dateFromParam ||
      dateToParam ||
      myWorksOnlyParam ||
      isOneWorkPerUserParam ||
      navigateToTagPage ||
      aiUsageParam !== "all" ||
      promptPublicParam !== "all",
  )

  // Initialize dialog mode from URL
  useEffect(() => {
    setIsDialogMode(dialogModeParam)
  }, [dialogModeParam])

  // Initialize view mode
  useEffect(() => {
    if (isExplore) {
      // 探索トップはページングで迷わず進める
      setViewMode("pagination")
      return
    }
    setViewMode(viewModeParam === "infinite" ? "infinite" : "pagination")
  }, [viewModeParam, isExplore])

  // Sort state
  const [sortOrder, setSortOrder] = useState<SortType>(sortParam as SortType)
  const [orderBy, setOrderBy] = useState<IntrospectionEnum<"WorkOrderBy">>(
    orderByParam as IntrospectionEnum<"WorkOrderBy">,
  )

  // Sort handlers
  const handleLikesSort = useCallback(() => {
    const newOrderBy = "LIKES_COUNT"
    const newSortOrder =
      orderBy === newOrderBy && sortOrder === "DESC" ? "ASC" : "DESC"
    setSortOrder(newSortOrder)
    setOrderBy(newOrderBy)

    const newParams = new URLSearchParams(searchParams)
    newParams.set("sort", newSortOrder)
    newParams.set("orderBy", newOrderBy)
    newParams.set("page", "0")
    setSearchParams(newParams)
  }, [orderBy, sortOrder, searchParams, setSearchParams])

  const handleBookmarksSort = useCallback(() => {
    const newOrderBy = "BOOKMARKS_COUNT"
    const newSortOrder =
      orderBy === newOrderBy && sortOrder === "DESC" ? "ASC" : "DESC"
    setSortOrder(newSortOrder)
    setOrderBy(newOrderBy)

    const newParams = new URLSearchParams(searchParams)
    newParams.set("sort", newSortOrder)
    newParams.set("orderBy", newOrderBy)
    newParams.set("page", "0")
    setSearchParams(newParams)
  }, [orderBy, sortOrder, searchParams, setSearchParams])

  const handleCommentsSort = useCallback(() => {
    const newOrderBy = "COMMENTS_COUNT"
    const newSortOrder =
      orderBy === newOrderBy && sortOrder === "DESC" ? "ASC" : "DESC"
    setSortOrder(newSortOrder)
    setOrderBy(newOrderBy)

    const newParams = new URLSearchParams(searchParams)
    newParams.set("sort", newSortOrder)
    newParams.set("orderBy", newOrderBy)
    newParams.set("page", "0")
    setSearchParams(newParams)
  }, [orderBy, sortOrder, searchParams, setSearchParams])

  const handleViewsSort = useCallback(() => {
    const newOrderBy = "VIEWS_COUNT"
    const newSortOrder =
      orderBy === newOrderBy && sortOrder === "DESC" ? "ASC" : "DESC"
    setSortOrder(newSortOrder)
    setOrderBy(newOrderBy)

    const newParams = new URLSearchParams(searchParams)
    newParams.set("sort", newSortOrder)
    newParams.set("orderBy", newOrderBy)
    newParams.set("page", "0")
    setSearchParams(newParams)
  }, [orderBy, sortOrder, searchParams, setSearchParams])

  const handleTitleSort = useCallback(() => {
    const newOrderBy = "NAME"
    const newSortOrder =
      orderBy === newOrderBy && sortOrder === "DESC" ? "ASC" : "DESC"
    setSortOrder(newSortOrder)
    setOrderBy(newOrderBy)

    const newParams = new URLSearchParams(searchParams)
    newParams.set("sort", newSortOrder)
    newParams.set("orderBy", newOrderBy)
    newParams.set("page", "0")
    setSearchParams(newParams)
  }, [orderBy, sortOrder, searchParams, setSearchParams])

  const handleDateCreatedSort = useCallback(() => {
    const newOrderBy = "DATE_CREATED"
    const newSortOrder =
      orderBy === newOrderBy && sortOrder === "DESC" ? "ASC" : "DESC"
    setSortOrder(newSortOrder)
    setOrderBy(newOrderBy)

    const newParams = new URLSearchParams(searchParams)
    newParams.set("sort", newSortOrder)
    newParams.set("orderBy", newOrderBy)
    newParams.set("page", "0")
    setSearchParams(newParams)
  }, [orderBy, sortOrder, searchParams, setSearchParams])

  // Check if current page is R18 page
  const isR18Page = location.pathname.includes("/r/")

  // Filter state
  const [filterValues, setFilterValues] = useState<FilterValues>({
    ageRestrictions: ratings,
    aiUsage: aiUsageParam,
    promptPublic: promptPublicParam,
    dateFrom: dateFromParam
      ? new Date(dateFromParam)
      : periodRange.length === 2
        ? new Date(periodRange[0])
        : undefined,
    dateTo: dateToParam
      ? new Date(dateToParam)
      : periodRange.length === 2
        ? new Date(periodRange[1])
        : undefined,
    myWorksOnly: myWorksOnlyParam,
    isOneWorkPerUser: isOneWorkPerUserParam,
    selectedModelId: modelParam,
    modelSearch: "",
    workModelId: modelParam, // modelパラメータをworkModelIdとして使用
    navigateToTagPage,
  })

  // URLパラメータ変更（SearchHeaderなど）をフィルタ状態へ同期する
  useEffect(() => {
    setFilterValues((prev) => ({
      ...prev,
      selectedModelId: modelParam,
      workModelId: modelParam,
    }))
  }, [modelParam])

  // Create GraphQL where condition
  const where = useMemo(() => {
    const conditions: Record<string, unknown> = {}

    // Search words - highest priority
    if (searchWords.length > 0) {
      conditions.search = searchWords.join(" ")
    }

    console.log("filterValues", filterValues)

    // Age restrictions
    if (filterValues.ageRestrictions.length > 0) {
      conditions.ratings = filterValues.ageRestrictions
    } else {
      // Default ratings based on page type
      if (isR18Page) {
        // /r/search page: show all ratings
        conditions.ratings = isLoggedIn
          ? ["G", "R15", "R18"]
          : ["G", "R15", "R18"]
      } else {
        // /search page: show only G and R15
        conditions.ratings = ["G", "R15"]
      }
    }

    // AI usage filter
    if (filterValues.aiUsage && filterValues.aiUsage !== "all") {
      if (filterValues.aiUsage === "ai") {
        conditions.hasPrompt = true
      } else if (filterValues.aiUsage === "no-ai") {
        conditions.hasPrompt = false
      }
    }

    // Prompt public filter
    if (filterValues.promptPublic && filterValues.promptPublic !== "all") {
      conditions.hasPrompt = true
      conditions.isPromptPublic = filterValues.promptPublic === "public"
    }

    // My works only filter
    if (filterValues.myWorksOnly && authContext.userId) {
      conditions.userId = authContext.userId
    }

    // Date range
    if (filterValues.dateFrom && filterValues.dateTo) {
      conditions.createdAtRange = {
        startDate: format(filterValues.dateFrom, "yyyy-MM-dd"),
        endDate: format(filterValues.dateTo, "yyyy-MM-dd"),
      }
    }

    // AI model
    if (filterValues.workModelId) {
      conditions.modelPostedIds = [filterValues.workModelId]
    }

    // One work per user filter
    if (filterValues.isOneWorkPerUser) {
      conditions.isOneWorkPerUser = true
    }

    // Sort condition
    conditions.orderBy = orderBy
    conditions.sort = sortOrder

    return conditions
  }, [
    filterValues,
    isLoggedIn,
    searchWords,
    showLatestWorks,
    authContext.userId,
    orderBy,
    sortOrder,
    isR18Page,
  ])

  console.log("searchWords", searchWords)
  console.log("where", where)
  console.log("viewMode", viewMode)

  // Pagination query - unified for both pagination and infinite scroll
  const { data, loading, fetchMore } = useQuery(SearchWorksQuery, {
    variables: {
      offset: viewMode === "pagination" ? currentPage * PER_PAGE : 0,
      limit: PER_PAGE,
      where,
    },
    errorPolicy: "ignore",
    notifyOnNetworkStatusChange: true,
  })

  // Count query
  const { data: countData } = useQuery(SearchWorksCountQuery, {
    variables: { where },
    // fetchPolicy: "cache-first",
    errorPolicy: "ignore",
  })

  // Infinite scroll setup
  const { pages, appendPage, replaceFirstPage, flat } = usePagedInfinite<
    FragmentOf<typeof PhotoAlbumWorkFragment>
  >([], "search-works")

  // Debug logging with all variables available
  console.log("Current filter state:", {
    filterValues,
    isInfiniteMode: viewMode === "infinite",
    dataLength: data?.works?.length || 0,
    flatLength: flat.length,
    pagesLength: pages.length,
  })

  // Reset infinite scroll when filters, sort, or search change
  const whereString = JSON.stringify(where)
  const prevWhereStringRef = useRef("")

  useEffect(() => {
    const currentWhereString = whereString
    if (
      viewMode === "infinite" &&
      currentWhereString !== prevWhereStringRef.current &&
      prevWhereStringRef.current !== ""
    ) {
      console.log("Resetting infinite scroll due to filter change")
      // Reset pages but don't clear immediately - let the data update first
      setIsLoadingMore(false)
    }
    prevWhereStringRef.current = currentWhereString
  }, [whereString, viewMode])

  // Initialize/update first page for infinite scroll - improved implementation
  useEffect(() => {
    if (viewMode !== "infinite") return

    console.log("Data update check:", {
      hasData: !!data?.works,
      dataLength: data?.works?.length || 0,
      currentPagesLength: pages.length,
      currentFlatLength: flat.length,
    })

    if (data?.works?.length) {
      console.log("Updating first page with data:", data.works.length, "items")
      // Always replace first page when data changes in infinite mode
      replaceFirstPage(data.works)
    } else if (data?.works?.length === 0) {
      console.log("No data found, clearing pages")
      replaceFirstPage([])
    }
  }, [data?.works, viewMode, replaceFirstPage, whereString])

  // hasNext calculation - similar to home feed implementation
  const hasNext = useMemo(() => {
    if (viewMode !== "infinite") return false
    if (pages.length === 0) return true

    const lastPage = pages[pages.length - 1] ?? []
    // Use a margin similar to home feed implementation (PER_PAGE - 8)
    const hasMoreData = lastPage.length >= PER_PAGE - 8

    console.log("hasNext calculation:", {
      pagesLength: pages.length,
      lastPageLength: lastPage.length,
      PER_PAGE,
      hasMoreData,
    })

    return hasMoreData
  }, [viewMode, pages])

  const loadMore = useCallback(async () => {
    if (!hasNext || loading || isLoadingMore) {
      console.log("loadMore blocked:", { hasNext, loading, isLoadingMore })
      return
    }

    console.log("Starting loadMore, offset:", flat.length)
    setIsLoadingMore(true)
    try {
      const result = await fetchMore({
        variables: {
          offset: flat.length,
          limit: PER_PAGE,
          where,
        },
      })
      if (result.data?.works?.length) {
        console.log("Loaded more works:", result.data.works.length)
        appendPage(result.data.works)
      } else {
        console.log("No more works found")
      }
    } catch (e) {
      console.error("Failed to load more works:", e)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    hasNext,
    loading,
    isLoadingMore,
    fetchMore,
    flat.length,
    where,
    appendPage,
  ])

  // Infinite scroll ref - using optimized version with mobile enhancements
  const sentinelRef = useInfiniteScroll(loadMore, {
    hasNext,
    loading: loading || isLoadingMore,
  })

  // Handle filter changes
  const handleFilterChange = useCallback(
    (values: FilterValues) => {
      setFilterValues(values)

      const newParams = new URLSearchParams(searchParams)

      // Update search words
      if (searchWords.length > 0) {
        newParams.set("search", searchWords.join(","))
      } else {
        newParams.delete("search")
      }

      // Update ratings
      if (values.ageRestrictions.length > 0) {
        newParams.set("rating", values.ageRestrictions.join(","))
      } else {
        newParams.delete("rating")
      }

      // Update AI usage
      if (values.aiUsage && values.aiUsage !== "all") {
        newParams.set("aiUsage", values.aiUsage)
      } else {
        newParams.delete("aiUsage")
      }

      // Update prompt public
      if (values.promptPublic && values.promptPublic !== "all") {
        newParams.set("promptPublic", values.promptPublic)
      } else {
        newParams.delete("promptPublic")
      }

      // Update my works only
      if (values.myWorksOnly) {
        newParams.set("myWorksOnly", "true")
      } else {
        newParams.delete("myWorksOnly")
      }

      // Update one work per user
      if (values.isOneWorkPerUser) {
        newParams.set("isOneWorkPerUser", "true")
      } else {
        newParams.delete("isOneWorkPerUser")
      }

      // Update period (individual dateFrom and dateTo)
      if (values.dateFrom) {
        newParams.set("dateFrom", format(values.dateFrom, "yyyy-MM-dd"))
      } else {
        newParams.delete("dateFrom")
      }

      if (values.dateTo) {
        newParams.set("dateTo", format(values.dateTo, "yyyy-MM-dd"))
      } else {
        newParams.delete("dateTo")
      }

      // Also update legacy period parameter for compatibility
      if (values.dateFrom && values.dateTo) {
        newParams.set(
          "period",
          `${format(values.dateFrom, "yyyy-MM-dd")},${format(values.dateTo, "yyyy-MM-dd")}`,
        )
      } else {
        newParams.delete("period")
      }

      // Update model
      if (values.workModelId) {
        newParams.set("workModelId", values.workModelId)
      } else {
        newParams.delete("workModelId")
      }

      // Update navigateToTagPage
      if (values.navigateToTagPage) {
        newParams.set("navigateToTagPage", "true")
      } else {
        newParams.delete("navigateToTagPage")
      }

      // Reset page for pagination mode
      if (viewMode === "pagination") {
        newParams.set("page", "0")
      }

      setSearchParams(newParams)
    },
    [searchParams, setSearchParams, viewMode, searchWords],
  )

  // Handle work selection
  const handleWorkSelect = useCallback(
    (workId: string) => {
      const works = viewMode === "infinite" ? flat : data?.works || []
      const workIndex = works.findIndex((work) => work.id === workId)
      const work = works[workIndex]

      if (filterValues.navigateToTagPage && work?.tagNames?.length) {
        const firstTag = work.tagNames[0]
        const hasR18 = work.rating === "R18"
        const tagPath = hasR18 ? `/r/tags/${firstTag}` : `/tags/${firstTag}`
        navigate(tagPath)
      } else if (isDialogMode) {
        workDialog.openDialog(workId)
      } else {
        // ダイアログモードでない場合は作品詳細ページへ遷移
        const hasR18 = work?.rating === "R18"
        const workPath = hasR18 ? `/r/posts/${workId}` : `/posts/${workId}`
        navigate(workPath)
      }
    },
    [
      filterValues.navigateToTagPage,
      viewMode,
      flat,
      data?.works,
      navigate,
      isDialogMode,
      workDialog.openDialog,
    ],
  )

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (mode: "pagination" | "infinite") => {
      setViewMode(mode)
      const newParams = new URLSearchParams(searchParams)

      // Set viewMode parameter
      newParams.set("viewMode", mode)

      if (mode === "infinite") {
        newParams.delete("page")
        // When switching to infinite mode, reset and initialize with current data
        console.log("Switching to infinite mode, initializing data")
        setIsLoadingMore(false)
        // Don't clear pages here - let the useEffect handle data initialization
      } else {
        newParams.set("page", "0")
      }

      setSearchParams(newParams)
    },
    [searchParams, setSearchParams],
  )

  // Handle dialog mode toggle
  const handleDialogModeChange = useCallback(
    (enabled: boolean) => {
      setIsDialogMode(enabled)
      const newParams = new URLSearchParams(searchParams)

      if (enabled) {
        newParams.set("dialogMode", "true")
      } else {
        newParams.delete("dialogMode")
      }

      setSearchParams(newParams)
    },
    [searchParams, setSearchParams],
  )

  // Handle page change for pagination
  const handlePageChange = useCallback(
    (page: number) => {
      const safePage = Math.max(0, page)
      const newParams = new URLSearchParams(searchParams)
      newParams.set("page", safePage.toString())
      setSearchParams(newParams)
    },
    [searchParams, setSearchParams],
  )

  // Current works based on view mode with improved logic
  const currentWorks = useMemo(() => {
    console.log("currentWorks calculation:", {
      viewMode,
      flatLength: flat.length,
      dataWorksLength: data?.works?.length || 0,
      pagesLength: pages.length,
    })

    // 探索トップ（ページ0）は、SSR(loader)で取った作品を優先して即表示する
    if (
      isExplore &&
      !hasAnyUserSearch &&
      viewMode === "pagination" &&
      currentPage === 0 &&
      initialWorks.length > 0
    ) {
      if (data?.works?.length) return data.works
      return initialWorks
    }

    if (viewMode === "infinite") {
      // In infinite mode, prioritize flat data if available and non-empty
      if (flat.length > 0) {
        console.log("Using flat data for infinite mode:", flat.length)
        return flat
      }
      // If flat is empty but we have initial data, use initial data
      if (data?.works?.length) {
        console.log("Using initial data for infinite mode:", data.works.length)
        return data.works
      }
      // Return empty array if no data
      return []
    }

    // For pagination mode, always use data.works
    return data?.works || []
  }, [
    viewMode,
    flat,
    data?.works,
    pages.length,
    isExplore,
    hasAnyUserSearch,
    initialWorks,
    currentPage,
  ])
  const totalCount = countData?.worksCount || 0
  const totalPages = Math.ceil(totalCount / PER_PAGE)

  // Handle model tag removal
  const handleModelTagRemove = useCallback(() => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete("model")
    newParams.delete("workModelId")

    setSearchParams(newParams, { replace: true })
  }, [searchParams, setSearchParams])

  // Active filters summary
  const activeFilters = useMemo(() => {
    const filters: string[] = []

    if (searchWords.length > 0) {
      filters.push(`${t("検索", "Search")}: ${searchWords.join(", ")}`)
    }

    if (
      filterValues.ageRestrictions.length > 0 &&
      filterValues.ageRestrictions.length < 3
    ) {
      filters.push(
        `${t("レーティング", "Rating")}: ${filterValues.ageRestrictions.join(", ")}`,
      )
    }

    if (filterValues.aiUsage && filterValues.aiUsage !== "all") {
      const aiLabel =
        filterValues.aiUsage === "ai"
          ? t("AI使用", "AI used")
          : t("AI未使用", "No AI")
      filters.push(`${t("AI", "AI")}: ${aiLabel}`)
    }

    if (filterValues.promptPublic && filterValues.promptPublic !== "all") {
      const promptLabel =
        filterValues.promptPublic === "public"
          ? t("公開", "Public")
          : t("非公開", "Private")
      filters.push(`${t("プロンプト", "Prompt")}: ${promptLabel}`)
    }

    if (filterValues.myWorksOnly) {
      filters.push(t("自分の作品のみ", "My works only"))
    }

    if (filterValues.isOneWorkPerUser) {
      filters.push(t("ユーザー毎に1作品", "One work per user"))
    }

    if (filterValues.dateFrom && filterValues.dateTo) {
      filters.push(
        `${t("期間", "Period")}: ${format(filterValues.dateFrom, "yyyy/MM/dd")} - ${format(filterValues.dateTo, "yyyy/MM/dd")}`,
      )
    }

    // モデル検索は専用のタグ表示で行うため、ここでは除外

    return filters
  }, [filterValues, models, t, searchWords])

  return (
    <div className="space-y-6">
      {!isExplore ? (
        <>
          {/* モデル検索時の専用タグ表示 */}
          {filterValues.workModelId && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                <span>
                  {t("モデル", "Model")}:{" "}
                  {models.find(
                    (m) => m.workModelId === filterValues.workModelId,
                  )?.displayName || filterValues.workModelId}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                  onClick={handleModelTagRemove}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}

          {/* Filter Section */}
          <CompactFilter
            filters={filterValues}
            onFiltersChange={handleFilterChange}
            onApplyFilters={() => {}}
            isLoading={loading}
          />

          {/* Active Filters Display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="text-xs">
                  {filter}
                </Badge>
              ))}
            </div>
          )}

          {/* Dialog Mode Notice */}
          {isDialogMode && (
            <div className="rounded-lg bg-blue-50 p-3 text-blue-700 text-sm dark:bg-blue-950 dark:text-blue-300">
              {t(
                "ダイアログモードが有効です。作品をクリックするとダイアログで表示されます。",
                "Dialog mode is enabled. Clicking on works will open them in a dialog.",
              )}
            </div>
          )}
          <div className="flex items-center gap-4">
            <SearchWorksSortableSetting
              nowSort={sortOrder}
              allOrderBy={[
                "LIKES_COUNT",
                "BOOKMARKS_COUNT",
                "COMMENTS_COUNT",
                "VIEWS_COUNT",
                "NAME",
                "DATE_CREATED",
              ]}
              nowOrderBy={orderBy}
              setSort={setSortOrder}
              onClickTitleSortButton={handleTitleSort}
              onClickLikeSortButton={handleLikesSort}
              onClickBookmarkSortButton={handleBookmarksSort}
              onClickCommentSortButton={handleCommentsSort}
              onClickViewSortButton={handleViewsSort}
              onClickDateSortButton={handleDateCreatedSort}
            />
            <div className="mx-2 h-6 w-px bg-border" />
            <Button
              variant={isDialogMode ? "default" : "outline"}
              size="sm"
              onClick={() => handleDialogModeChange(!isDialogMode)}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              {t("ダイアログ", "Dialog Mode")}
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Eye className="h-4 w-4" />
              {t("", "")}
              {totalCount}
              {t("件", " works")}
            </div>
          </div>
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "pagination" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewModeChange("pagination")}
                className="flex items-center gap-1"
              >
                <List className="h-4 w-4" />
                {t("ページ送り", "Pagination")}
              </Button>
              <Button
                variant={viewMode === "infinite" ? "default" : "outline"}
                size="sm"
                onClick={() => handleViewModeChange("infinite")}
                className="flex items-center gap-1"
              >
                <Grid className="h-4 w-4" />
                {t("フィード", "Infinite Scroll")}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Results */}
      {loading && currentWorks.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            {t("検索中...", "Searching...")}
          </span>
        </div>
      ) : currentWorks.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {t(
              "条件に一致する作品が見つかりませんでした",
              "No works found matching the conditions",
            )}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <ResponsivePhotoWorksAlbum
            works={currentWorks}
            onSelect={handleWorkSelect}
            isShowProfile={true}
          />

          {/* Infinite scroll UI は探索トップでは使わない */}
          {!isExplore && viewMode === "infinite" && hasNext && (
            <div ref={sentinelRef} className="h-1" />
          )}

          {!isExplore && viewMode === "infinite" && isLoadingMore && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                {t("読み込み中...", "Loading...")}
              </span>
            </div>
          )}

          {/* Pagination */}
          {viewMode === "pagination" && totalPages > 1 && (
            <div className="flex justify-center">
              <ResponsivePagination
                maxCount={totalCount}
                perPage={PER_PAGE}
                currentPage={Math.max(0, currentPage)}
                onPageChange={(page) => handlePageChange(page)}
              />
            </div>
          )}
        </div>
      )}

      {/* Work Viewer Dialog */}
      {workDialog.isOpen && workDialog.workId && (
        <WorkViewerDialog
          works={currentWorks}
          startWorkId={workDialog.workId}
          onClose={workDialog.closeDialog}
        />
      )}
    </div>
  )
}
