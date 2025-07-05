import { useQuery } from "@apollo/client/index"
import { graphql, type FragmentOf } from "gql.tada"
import { useSearchParams } from "@remix-run/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import {
  ResponsivePhotoWorksAlbum,
  PhotoAlbumWorkFragment,
} from "~/components/responsive-photo-works-album"
import { ResponsivePagination } from "~/components/responsive-pagination"
import { useTranslation } from "~/hooks/use-translation"
import { AuthContext } from "~/contexts/auth-context"
import { useContext } from "react"
import {
  CompactFilter,
  type FilterValues,
  type AiModel,
} from "~/components/compact-filter"
import { format } from "date-fns"
import { Badge } from "~/components/ui/badge"
import { Loader2 } from "lucide-react"

const PER_PAGE = 32

type Props = {
  initialWorks?: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  models?: AiModel[]
}

export const SearchResults = ({ initialWorks = [], models = [] }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const authContext = useContext(AuthContext)
  const t = useTranslation()
  const [currentPage, setCurrentPage] = useState(0)
  const [isSearching, setIsSearching] = useState(false)

  // URLパラメータからフィルタ条件を取得
  const searchQuery = searchParams.get("q") || ""
  const urlRating = searchParams.get("rating")
  const urlAiUsage = searchParams.get("ai")
  const urlPromptPublic = searchParams.get("prompt")
  const urlDateFrom = searchParams.get("dateFrom")
  const urlDateTo = searchParams.get("dateTo")
  const urlMyWorksOnly = searchParams.get("myWorksOnly") === "true"
  const urlModelIds =
    searchParams.get("modelIds")?.split(",").filter(Boolean) || []

  // フィルタ状態の初期化（URLパラメータから復元）
  const [filters, setFilters] = useState<FilterValues>(() => ({
    ageRestrictions: urlRating && urlRating !== "all" ? [urlRating] : [],
    aiUsage: urlAiUsage || "all",
    promptPublic: urlPromptPublic || "all",
    dateFrom: urlDateFrom ? new Date(urlDateFrom) : undefined,
    dateTo: urlDateTo ? new Date(urlDateTo) : undefined,
    myWorksOnly: urlMyWorksOnly,
    selectedModelIds: urlModelIds,
    modelSearch: "",
  }))

  // URLパラメータが変更された際にフィルタ状態を更新
  useEffect(() => {
    setFilters({
      ageRestrictions: urlRating && urlRating !== "all" ? [urlRating] : [],
      aiUsage: urlAiUsage || "all",
      promptPublic: urlPromptPublic || "all",
      dateFrom: urlDateFrom ? new Date(urlDateFrom) : undefined,
      dateTo: urlDateTo ? new Date(urlDateTo) : undefined,
      myWorksOnly: urlMyWorksOnly,
      selectedModelIds: urlModelIds,
      modelSearch: "",
    })
  }, [
    urlRating,
    urlAiUsage,
    urlPromptPublic,
    urlDateFrom,
    urlDateTo,
    urlMyWorksOnly,
    urlModelIds,
  ])

  // デバウンス用のタイマー
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  )

  // フィルタ変更時のデバウンス処理
  const handleFilterChange = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters)
      setIsSearching(true)

      // 既存のタイマーをクリア
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // 新しいタイマーを設定
      const timer = setTimeout(() => {
        const newParams = new URLSearchParams(searchParams)

        // フィルタ条件をURLパラメータに設定
        if (newFilters.ageRestrictions.length > 0) {
          newParams.set("rating", newFilters.ageRestrictions[0])
        } else {
          newParams.delete("rating")
        }

        if (newFilters.aiUsage !== "all") {
          newParams.set("ai", newFilters.aiUsage)
        } else {
          newParams.delete("ai")
        }

        if (newFilters.promptPublic !== "all") {
          newParams.set("prompt", newFilters.promptPublic)
        } else {
          newParams.delete("prompt")
        }

        if (newFilters.dateFrom) {
          newParams.set(
            "dateFrom",
            newFilters.dateFrom.toISOString().split("T")[0],
          )
        } else {
          newParams.delete("dateFrom")
        }

        if (newFilters.dateTo) {
          newParams.set("dateTo", newFilters.dateTo.toISOString().split("T")[0])
        } else {
          newParams.delete("dateTo")
        }

        if (newFilters.myWorksOnly) {
          newParams.set("myWorksOnly", "true")
        } else {
          newParams.delete("myWorksOnly")
        }

        if (
          newFilters.selectedModelIds &&
          newFilters.selectedModelIds.length > 0
        ) {
          newParams.set("modelIds", newFilters.selectedModelIds.join(","))
        } else {
          newParams.delete("modelIds")
        }

        setSearchParams(newParams)
        setIsSearching(false)
      }, 500)

      setDebounceTimer(timer)
    },
    [searchParams, setSearchParams, debounceTimer],
  )

  // GraphQLのWhere条件を構築
  const whereCondition = useMemo(() => {
    const where: {
      orderBy: "LIKES_COUNT"
      ratings?: ("G" | "R15" | "R18" | "R18G")[]
      hasPrompt?: boolean
      isPromptPublic?: boolean
      tagNames?: string[]
      createdAtAfter?: string
      beforeCreatedAt?: string
      userId?: string
      workModelIds?: string[]
    } = {
      orderBy: "LIKES_COUNT",
    }

    // 年齢制限フィルタ
    if (filters.ageRestrictions.length > 0) {
      const rating = filters.ageRestrictions[0]
      if (rating === "R18") {
        where.ratings = ["R18", "R18G"]
      } else {
        where.ratings = [rating as "G" | "R15" | "R18" | "R18G"]
      }
    } else {
      where.ratings = ["G", "R15"]
    }

    // AI使用フィルタ
    if (filters.aiUsage !== "all") {
      if (filters.aiUsage === "ai") {
        where.hasPrompt = true
      } else if (filters.aiUsage === "no-ai") {
        where.hasPrompt = false
      }
    }

    // プロンプト公開状態フィルタ
    if (filters.promptPublic !== "all") {
      where.hasPrompt = true
      where.isPromptPublic = filters.promptPublic === "public"
    }

    // 期間フィルタ
    if (filters.dateFrom) {
      where.createdAtAfter = new Date(filters.dateFrom).toISOString()
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo)
      endDate.setHours(23, 59, 59, 999)
      where.beforeCreatedAt = endDate.toISOString()
    }

    // 検索キーワード
    if (searchQuery) {
      where.tagNames = [searchQuery]
    }

    // 自分の作品のみ
    if (filters.myWorksOnly && authContext.userId) {
      where.userId = authContext.userId
    }

    // AIモデルフィルタ
    if (filters.selectedModelIds && filters.selectedModelIds.length > 0) {
      where.workModelIds = filters.selectedModelIds
    }

    return where
  }, [filters, searchQuery, authContext.userId])

  const { data, loading } = useQuery(SearchWorksQuery, {
    skip: authContext.isLoading || !searchQuery,
    variables: {
      offset: currentPage * PER_PAGE,
      limit: PER_PAGE,
      where: whereCondition,
    },
    fetchPolicy: "cache-and-network",
  })

  const { data: countData } = useQuery(SearchWorksCountQuery, {
    skip: authContext.isLoading || !searchQuery,
    variables: {
      where: whereCondition,
    },
    fetchPolicy: "cache-and-network",
  })

  const works = data?.works || initialWorks
  const worksCount = countData?.worksCount || 0

  // URLパラメータが変更された際にページをリセット
  useEffect(() => {
    setCurrentPage(0)
  }, [filters, searchQuery])

  // フィルタサマリーの生成
  const filterSummary = useMemo(() => {
    const badges = []

    if (filters.ageRestrictions.length > 0) {
      badges.push(
        ...filters.ageRestrictions.map(
          (rating) => `${t("年齢制限", "Age restriction")}: ${rating}`,
        ),
      )
    }

    if (filters.aiUsage !== "all") {
      const aiLabel =
        filters.aiUsage === "ai"
          ? t("AI使用", "AI used")
          : t("AI未使用", "No AI")
      badges.push(`${t("AI", "AI")}: ${aiLabel}`)
    }

    if (filters.promptPublic !== "all") {
      const promptLabel =
        filters.promptPublic === "public"
          ? t("公開", "Public")
          : t("非公開", "Private")
      badges.push(`${t("プロンプト", "Prompt")}: ${promptLabel}`)
    }

    if (filters.dateFrom || filters.dateTo) {
      const fromStr = filters.dateFrom
        ? format(filters.dateFrom, "yyyy/MM/dd")
        : ""
      const toStr = filters.dateTo ? format(filters.dateTo, "yyyy/MM/dd") : ""
      if (fromStr && toStr) {
        badges.push(`${t("期間", "Period")}: ${fromStr} - ${toStr}`)
      } else if (fromStr) {
        badges.push(`${t("開始日", "From")}: ${fromStr}`)
      } else if (toStr) {
        badges.push(`${t("終了日", "To")}: ${toStr}`)
      }
    }

    if (filters.myWorksOnly) {
      badges.push(t("自分の作品のみ", "My works only"))
    }

    if (filters.selectedModelIds && filters.selectedModelIds.length > 0) {
      if (filters.selectedModelIds.length === 1) {
        const firstModelId = filters.selectedModelIds[0]
        const modelName =
          models.find((m) => m.id === firstModelId)?.displayName ||
          models.find((m) => m.id === firstModelId)?.name ||
          firstModelId
        badges.push(`${t("AIモデル", "AI Model")}: ${modelName}`)
      } else {
        badges.push(
          `${t("AIモデル", "AI Model")}: ${filters.selectedModelIds.length}${t("個選択", " selected")}`,
        )
      }
    }

    return badges
  }, [filters, t, models])

  if (!searchQuery && initialWorks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("検索キーワードを入力してください", "Please enter a search keyword")}
      </div>
    )
  }

  if (loading && currentPage === 0) {
    return (
      <div className="py-8 text-center">{t("検索中...", "Searching...")}</div>
    )
  }

  if (!loading && works.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {t("検索結果が見つかりませんでした", "No search results found")}
      </div>
    )
  }

  const hasActiveFilters = filterSummary.length > 0

  return (
    <div className="space-y-6">
      {/* コンパクトフィルタ */}
      <div className="flex items-center justify-between">
        <CompactFilter
          filters={filters}
          onFiltersChange={handleFilterChange}
          onApplyFilters={() => {}}
          models={models}
          showMyWorksOnly={true}
        />
        {isSearching && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("検索中...", "Searching...")}
          </div>
        )}
      </div>

      {/* フィルタサマリー */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <div className="text-muted-foreground text-sm">
            {t("適用中のフィルタ", "Active filters")}:
          </div>
          <div className="flex flex-wrap gap-2">
            {filterSummary.map((badge) => (
              <Badge key={badge} variant="secondary" className="text-xs">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* 検索結果の情報 */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          {searchQuery && (
            <span>
              「{searchQuery}」{t("の検索結果", "search results")}
              {hasActiveFilters && (
                <span className="ml-2 text-primary">
                  ({t("フィルタ適用中", "Filters applied")})
                </span>
              )}
            </span>
          )}
        </div>
        <div className="text-muted-foreground text-sm">
          {worksCount > 0 && (
            <span>
              {worksCount.toLocaleString()}
              {t("件", " items")}
            </span>
          )}
        </div>
      </div>

      {/* 作品一覧 */}
      <ResponsivePhotoWorksAlbum works={works} />

      {/* ページネーション */}
      {worksCount > PER_PAGE && (
        <div className="flex justify-center">
          <ResponsivePagination
            perPage={PER_PAGE}
            maxCount={worksCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

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
