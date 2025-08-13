import { graphql, type FragmentOf } from "gql.tada"
import { ResponsivePagination } from "~/components/responsive-pagination"
import {
  type PhotoAlbumWorkFragment,
  ResponsivePhotoWorksAlbum,
} from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useApolloClient, useQuery } from "@apollo/client/index"
import {
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react"
import { tagWorksQuery } from "~/routes/($lang)._main.tags.$tag._index/route"
import { CroppedWorkSquare } from "~/components/cropped-work-square"
import { TagFollowButton } from "~/components/button/tag-follow-button"
import { TagActionOther } from "~/routes/($lang)._main.tags._index/components/tag-action-other"
import { WorksListSortableSetting } from "~/routes/($lang).my._index/components/works-list-sortable-setting"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { SortType } from "~/types/sort-type"
import { useTranslation } from "~/hooks/use-translation"
import { Switch } from "~/components/ui/switch"
import { Button } from "~/components/ui/button"
import { Grid, List, PlaySquare, ExternalLink } from "lucide-react"
import { CompactFilter, type FilterValues } from "~/components/compact-filter"

import { useNavigate } from "@remix-run/react"
import { WorkViewerDialog } from "~/components/work/work-viewer-dialog"
import { Separator } from "~/components/ui/separator"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"

// ──────────────────────────────────────────────────────────────────────────────
// GraphQL
// ──────────────────────────────────────────────────────────────────────────────
const viewerFollowedTagsQuery = graphql(
  `query ViewerFollowedTags($offset: Int!, $limit: Int!) {
    viewer {
      id
      followingTags(offset: $offset, limit: $limit) {
        id
        name
      }
    }
  }`,
)

// ──────────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────────

type Props = {
  works: FragmentOf<typeof PhotoAlbumWorkFragment>[]
  worksCount: number
  tag: string
  page: number
  sort: SortType
  orderBy: IntrospectionEnum<"WorkOrderBy">
  hasPrompt: number
  mode: "feed" | "pagination"
  setPage: (page: number) => void
  setMode: (mode: "feed" | "pagination") => void
  setAccessType?: (accessType: IntrospectionEnum<"AccessType"> | null) => void
  setWorkType: (workType: IntrospectionEnum<"WorkType"> | null) => void
  setRating: (rating: IntrospectionEnum<"Rating"> | null) => void
  setSort: (sort: SortType) => void
  setHasPrompt: (hasPrompt: number) => void
  onClickTitleSortButton: () => void
  onClickLikeSortButton: () => void
  onClickBookmarkSortButton: () => void
  onClickCommentSortButton: () => void
  onClickViewSortButton: () => void
  onClickAccessTypeSortButton: () => void
  onClickDateSortButton: () => void
  onClickWorkTypeSortButton: () => void
  onClickIsPromotionSortButton: () => void
}

type LocalFilterValues = {
  ageRestrictions: string[]
  aiUsage: string
  promptPublic: string
  dateFrom: Date | undefined
  dateTo: Date | undefined
  orderBy: string
  workModelId: string | undefined
  myWorksOnly?: boolean
}

export function TagWorkSection(props: Props) {
  const authContext = useContext(AuthContext)
  const _client = useApolloClient()
  const navigate = useNavigate()

  // 表示モード状態（ページネーション / 無限スクロール）
  const [isPagination, setIsPagination] = useState(props.mode === "pagination")
  // 作品遷移モード（ダイアログ / 直接リンク）
  const [isDialogMode, setIsDialogMode] = useState(false)

  // Work dialog URL state management
  const workDialog = useWorkDialogUrl()

  // フィルタ状態と更新関数
  const [filters, setFilters] = useState<LocalFilterValues>({
    ageRestrictions: [],
    aiUsage: "all",
    promptPublic: "all",
    dateFrom: undefined,
    dateTo: undefined,
    orderBy: "LIKES_COUNT",
    workModelId: undefined, // 単体として初期化
    myWorksOnly: false,
  })

  // CompactFilterとの互換性のため、型変換を行う関数
  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    console.log("Received filters:", newFilters)
    setFilters({
      ageRestrictions: newFilters.ageRestrictions,
      aiUsage: newFilters.aiUsage,
      promptPublic: newFilters.promptPublic,
      dateFrom: newFilters.dateFrom,
      dateTo: newFilters.dateTo,
      orderBy: newFilters.orderBy || "LIKES_COUNT",
      workModelId: newFilters.workModelId, // 単体として設定
      myWorksOnly: newFilters.myWorksOnly || false,
    })
  }, [])

  // 無限スクロール用の状態
  const [infinitePages, setInfinitePages] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[][]
  >([])
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  // 初期データが設定されたかどうかのフラグ
  const [isInitialDataSet, setIsInitialDataSet] = useState(false)
  // 初期化完了フラグ
  const [isInitialized, setIsInitialized] = useState(false)

  // 状態管理用のキー
  const stateKey = `tag-works-${props.tag}-${props.orderBy}-${props.sort}-${props.hasPrompt}`

  const t = useTranslation()

  // フィルタ適用時の where 条件を生成
  const getFilteredWhereCondition = useCallback(() => {
    const baseWhere: {
      tagNames: string[]
      orderBy: IntrospectionEnum<"WorkOrderBy">
      sort: SortType
      ratings: ("G" | "R15" | "R18" | "R18G")[]
      hasPrompt?: boolean
      isPromptPublic?: boolean
      isNowCreatedAt: boolean
      modelNames?: string[]
      createdAtAfter?: string
      beforeCreatedAt?: string
      isSensitive?: boolean
      modelPostedIds?: string[]
      userId?: string
    } = {
      tagNames: [
        decodeURIComponent(props.tag),
        decodeURIComponent(props.tag).toLowerCase(),
        decodeURIComponent(props.tag).toUpperCase(),
        decodeURIComponent(props.tag).replace(/[\u30A1-\u30F6]/g, (m) =>
          String.fromCharCode(m.charCodeAt(0) - 96),
        ),
        decodeURIComponent(props.tag).replace(/[\u3041-\u3096]/g, (m) =>
          String.fromCharCode(m.charCodeAt(0) + 96),
        ),
      ],
      orderBy: props.orderBy,
      sort: props.sort,
      ratings: ["G", "R15"] as ("G" | "R15" | "R18" | "R18G")[],
      hasPrompt: props.hasPrompt === 1 ? true : undefined,
      isPromptPublic: props.hasPrompt === 1 ? true : undefined,
      isNowCreatedAt: true,
    }

    // 自分の作品のみフィルタ
    if (filters.myWorksOnly && authContext.userId) {
      baseWhere.userId = authContext.userId
    }

    // AIモデルフィルタ - modelPostedIdsを使用
    if (filters.workModelId) {
      baseWhere.modelPostedIds = [filters.workModelId]
    }

    console.log("Applied modelPostedIds:", baseWhere.modelPostedIds)

    // 年齢制限フィルタ
    if (filters.ageRestrictions.length > 0) {
      baseWhere.ratings = filters.ageRestrictions as (
        | "G"
        | "R15"
        | "R18"
        | "R18G"
      )[]
    }

    // プロンプト公開フィルタ
    if (filters.promptPublic === "public") {
      baseWhere.hasPrompt = true
      baseWhere.isPromptPublic = true
    } else if (filters.promptPublic === "private") {
      baseWhere.hasPrompt = false
      baseWhere.isPromptPublic = false
    }

    // 期間フィルタ
    if (filters.dateFrom) {
      baseWhere.createdAtAfter = filters.dateFrom.toISOString()
    }
    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo)
      endDate.setHours(23, 59, 59, 999)
      baseWhere.beforeCreatedAt = endDate.toISOString()
    }

    return baseWhere
  }, [
    props.tag,
    props.orderBy,
    props.sort,
    props.hasPrompt,
    filters,
    authContext.userId,
  ])

  console.log("Current filters:", getFilteredWhereCondition())

  const compactFilterValues: FilterValues = useMemo(
    () => ({
      ageRestrictions: filters.ageRestrictions,
      aiUsage: filters.aiUsage,
      promptPublic: filters.promptPublic,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      orderBy: filters.orderBy,
      workModelId: filters.workModelId,
      myWorksOnly: filters.myWorksOnly,
    }),
    [filters],
  )

  // フォロー中のタグを取得
  const { data: followedTagsData = null } = useQuery(viewerFollowedTagsQuery, {
    skip: authContext.isLoading || authContext.isNotLoggedIn,
    variables: { offset: 0, limit: 32 },
  })

  // co ────────────────────
  const { data: paginationResp, loading: paginationLoading } = useQuery(
    tagWorksQuery,
    {
      skip:
        !isPagination ||
        !isInitialized ||
        authContext.isLoading ||
        authContext.isNotLoggedIn,
      variables: {
        offset: props.page * 32,
        limit: 32,
        where: getFilteredWhereCondition(),
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "cache-and-network", // フィルタ変更時に再フェッチを確実に行う
    },
  )

  // ────────────────────　無限スクロール用クエリ ────────────────────
  const {
    data: infiniteResp,
    loading: infiniteLoading,
    fetchMore,
    refetch: refetchInfinite,
  } = useQuery(tagWorksQuery, {
    skip:
      isPagination ||
      !isInitialized ||
      authContext.isLoading ||
      authContext.isNotLoggedIn,
    variables: {
      offset: 0,
      limit: 32,
      where: getFilteredWhereCondition(),
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network", // フィルタ変更時に再フェッチを確実に行う
  })

  // フィルタ適用時の処理
  const handleFiltersApply = useCallback(() => {
    console.log("Filter applied, resetting infinite scroll")
    // フィルタが適用されたときの処理
    setIsInitialDataSet(false)
    setIsInitialized(false)
    setInfinitePages([])
    setHasNextPage(true)
    if (isPagination) {
      props.setPage(0)
    }

    // フィルタ適用後に初期化を再実行
    setTimeout(() => {
      setIsInitialized(true)
      // 無限スクロールモードの場合、クエリを再実行
      if (!isPagination && refetchInfinite) {
        refetchInfinite()
      }
    }, 0)
  }, [isPagination, props, refetchInfinite])

  // props.mode の変更を監視して内部状態を同期
  useEffect(() => {
    setIsPagination(props.mode === "pagination")
  }, [props.mode])

  // 初期化: props.worksを必ず使用
  useEffect(() => {
    if (!isInitialDataSet && props.works.length > 0) {
      if (!isPagination) {
        // フィードモードの場合、props.worksを初期データとして設定
        setInfinitePages([props.works])
        setHasNextPage(props.works.length === 32)
      }
      setIsInitialDataSet(true)
      setIsInitialized(true)

      // スクロール位置復元
      const scrollKey = isPagination
        ? `scroll-pagination-${stateKey}-${props.page}`
        : `scroll-infinite-${stateKey}`
      const savedScrollY = sessionStorage.getItem(scrollKey)
      if (savedScrollY) {
        setTimeout(
          () => window.scrollTo(0, Number.parseInt(savedScrollY, 10)),
          100,
        )
      }
    }
  }, [props.works, isPagination, isInitialDataSet, stateKey, props.page])

  // フィルタが変更された時にインフィニットクエリを再実行
  useEffect(() => {
    if (isInitialized && !isPagination && infiniteResp) {
      // フィルタ変更後の初回データを取得
      const newData = infiniteResp.tagWorks
      if (newData) {
        setInfinitePages([newData])
        setHasNextPage(newData.length === 32)
      }
    }
  }, [infiniteResp, isInitialized, isPagination])

  // ────────────────────　スクロール位置復元 (ページネーション) ────────────────────
  useEffect(() => {
    if (isPagination && isInitialized && typeof window !== "undefined") {
      const savedScrollY = sessionStorage.getItem(
        `scroll-pagination-${stateKey}-${props.page}`,
      )
      if (savedScrollY) {
        setTimeout(
          () => window.scrollTo(0, Number.parseInt(savedScrollY, 10)),
          100,
        )
      }
    }
  }, [isPagination, stateKey, props.page, isInitialized])

  // ページネーションモードでのスクロール位置保存
  useEffect(() => {
    if (!isPagination || !isInitialized) return

    const saveScrollPosition = () => {
      sessionStorage.setItem(
        `scroll-pagination-${stateKey}-${props.page}`,
        window.scrollY.toString(),
      )
    }

    const handleBeforeUnload = () => saveScrollPosition()
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      saveScrollPosition()
    }
  }, [isPagination, stateKey, props.page, isInitialized])

  // フィードモード位置保存
  useEffect(() => {
    if (isPagination || !isInitialized) return

    const saveScrollPosition = () => {
      sessionStorage.setItem(
        `scroll-infinite-${stateKey}`,
        window.scrollY.toString(),
      )
    }

    const handleBeforeUnload = () => saveScrollPosition()
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      saveScrollPosition()
    }
  }, [isPagination, stateKey, isInitialized])

  // ソート・タグ・フィルタ変更時リセット
  useEffect(() => {
    if (isInitialized) {
      setIsInitialDataSet(false)
      setIsInitialized(false)
      if (!isPagination) {
        setInfinitePages([])
        setHasNextPage(true)
        sessionStorage.removeItem(`scroll-infinite-${stateKey}`)
      }
    }
  }, [
    props.tag,
    props.orderBy,
    props.sort,
    props.hasPrompt,
    filters, // フィルタの変更も監視
    isPagination,
    stateKey,
  ])

  // 無限スクロール読み込み
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || isPagination || !isInitialized) return

    const flatWorks = infinitePages.flat()
    setIsLoadingMore(true)
    try {
      const whereCondition = getFilteredWhereCondition()
      console.log("Loading more with filter condition:", whereCondition)
      const result = await fetchMore({
        variables: {
          offset: flatWorks.length,
          limit: 32,
          where: whereCondition,
        },
      })
      if (result.data?.tagWorks) {
        const newWorks = result.data.tagWorks
        setInfinitePages((prev) => [...prev, newWorks])
        setHasNextPage(newWorks.length === 32)
      }
    } catch (error) {
      console.error("Failed to load more works:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [
    isLoadingMore,
    hasNextPage,
    isPagination,
    infinitePages,
    fetchMore,
    getFilteredWhereCondition,
    isInitialized,
  ])

  // Intersection Observer
  useEffect(() => {
    if (isPagination || !isInitialized) return
    const currentRef = loadingRef.current
    if (!currentRef) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )
    observerRef.current.observe(currentRef)
    return () => observerRef.current?.disconnect()
  }, [isPagination, hasNextPage, isLoadingMore, loadMore, isInitialized])

  // 表示作品の決定: フィルタ適用時は新しいクエリ結果を使用
  const displayedWorks = useMemo(() => {
    // 初期化が完了していない場合は必ずprops.worksを使用
    if (!isInitialized) {
      return props.works
    }

    if (isPagination) {
      // ページネーションモード: フィルタが適用されている場合はpaginationRespを優先
      if (paginationResp?.tagWorks) {
        return paginationResp.tagWorks
      }
      // 初回はprops.works、フィルタ未適用時
      return props.works
    }

    // フィードモード: フィルタが適用されている場合は新しいクエリ結果を使用
    const flat = infinitePages.flat()
    if (flat.length > 0) {
      return flat
    }

    // infiniteRespがある場合（フィルタ適用後の初回データ）
    if (infiniteResp?.tagWorks) {
      return infiniteResp.tagWorks
    }

    // フォールバック
    return props.works
  }, [
    isInitialized,
    isPagination,
    props.works,
    paginationResp,
    infinitePages,
    infiniteResp,
  ])

  // 一覧の最初の作品（バナー用）
  const firstWork = displayedWorks.length ? displayedWorks[0] : null

  const allSortType = [
    "LIKES_COUNT",
    "BOOKMARKS_COUNT",
    "COMMENTS_COUNT",
    "VIEWS_COUNT",
    "DATE_CREATED",
    "NAME",
  ] as IntrospectionEnum<"WorkOrderBy">[]

  const isFollowedTag = followedTagsData?.viewer?.followingTags.some(
    (t) => t.name === props.tag,
  )

  // ───────────────────────── mode 切替 ─────────────────────────
  const handleModeChange = (newMode: "pagination" | "feed") => {
    // 現在位置保存
    if (isPagination) {
      sessionStorage.setItem(
        `scroll-pagination-${stateKey}-${props.page}`,
        window.scrollY.toString(),
      )
    } else {
      sessionStorage.setItem(
        `scroll-infinite-${stateKey}`,
        window.scrollY.toString(),
      )
    }

    const newIsPagination = newMode === "pagination"
    setIsPagination(newIsPagination)
    props.setMode(newMode)

    // モード切替時は初期化をリセット
    setIsInitialDataSet(false)
    setIsInitialized(false)

    if (newIsPagination) {
      props.setPage(0)
    } else {
      setInfinitePages([])
      setHasNextPage(true)
    }
  }

  // ───────────────────────── 作品クリック ─────────────────────────
  const openWork = (idx: string) => {
    console.log("Open work with id:", idx)
    if (isDialogMode) {
      // ダイアログモードの場合、作品IDを直接渡す
      workDialog.openDialog(idx)
    } else {
      // 直接リンク遷移の場合、作品IDを使用
      navigate(`/posts/${idx}`)
    }
  }

  // ───────────────────────── ローディング判定 ─────────────────────────
  const isLoading = useMemo(() => {
    // 認証コンテキストがロード中の場合
    if (authContext.isLoading) {
      return true
    }

    // 未ログインの場合はローディングを表示しない
    if (authContext.isNotLoggedIn) {
      return false
    }

    // 初期化が完了していない場合
    if (!isInitialized) {
      return true
    }

    if (isPagination) {
      // ページネーションモード: クエリがローディング中の場合
      return paginationLoading
    }

    // フィードモード: クエリがローディング中で無限ページが空の場合
    return infiniteLoading && infinitePages.length === 0
  }, [
    authContext.isLoading,
    authContext.isNotLoggedIn,
    isInitialized,
    isPagination,
    paginationLoading,
    infiniteLoading,
    infinitePages.length,
  ])

  // ───────────────────────── JSX ─────────────────────────
  return (
    <div className="flex flex-col space-y-6">
      {/* ────────── バナー ────────── */}
      <div className="relative h-32">
        {firstWork?.smallThumbnailImageURL && (
          <div className="relative h-16 w-full overflow-hidden">
            <img
              src={firstWork.smallThumbnailImageURL}
              alt={`${props.tag} thumbnail`}
              className="h-full w-full object-cover opacity-50"
            />
          </div>
        )}
        <div className="absolute top-8 left-0">
          <div className="flex space-x-4">
            <div className="rounded-md border-2 border-white">
              {firstWork && (
                <CroppedWorkSquare
                  workId={firstWork.id}
                  imageUrl={firstWork.smallThumbnailImageURL}
                  thumbnailImagePosition={firstWork.thumbnailImagePosition ?? 0}
                  size="sm"
                  imageWidth={firstWork.smallThumbnailImageWidth}
                  imageHeight={firstWork.smallThumbnailImageHeight}
                />
              )}
            </div>
            <div className="mt-auto space-y-1">
              <h2 className="font-semibold text-gray-800 text-xl dark:text-gray-200">
                {props.tag}
                {t("の作品", " works")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {props.worksCount}
                {t("件の作品が見つかりました", " works found")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ────────── ソート & フィルタ エリア (md 以上) ────────── */}
      <div className="relative hidden items-center md:flex">
        <div className="flex items-center space-x-2">
          <WorksListSortableSetting
            nowSort={props.sort}
            nowOrderBy={props.orderBy}
            allOrderBy={allSortType}
            setSort={props.setSort}
            onClickTitleSortButton={props.onClickTitleSortButton}
            onClickLikeSortButton={props.onClickLikeSortButton}
            onClickBookmarkSortButton={props.onClickBookmarkSortButton}
            onClickCommentSortButton={props.onClickCommentSortButton}
            onClickViewSortButton={props.onClickViewSortButton}
            onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
            onClickDateSortButton={props.onClickDateSortButton}
            onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
            onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
          />
          <CompactFilter
            filters={compactFilterValues}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleFiltersApply}
            isLoading={isLoading}
          />
          <div className="flex items-center space-x-2">
            <Switch
              onClick={() => props.setHasPrompt(props.hasPrompt === 1 ? 0 : 1)}
              checked={props.hasPrompt === 1}
            />
            <span className="text-sm">{t("プロンプト有", "With Prompts")}</span>
          </div>
        </div>
        <div className="ml-auto flex w-64 items-center space-x-4">
          <TagFollowButton
            className="w-full"
            tag={props.tag}
            isFollow={isFollowedTag ?? false}
          />
          <TagActionOther tag={props.tag} />
        </div>
      </div>

      {/* ────────── ソート & フィルタ (モバイル) ────────── */}
      <div className="flex items-center space-x-2 md:hidden">
        <WorksListSortableSetting
          nowSort={props.sort}
          nowOrderBy={props.orderBy}
          allOrderBy={allSortType}
          setSort={props.setSort}
          onClickTitleSortButton={props.onClickTitleSortButton}
          onClickLikeSortButton={props.onClickLikeSortButton}
          onClickBookmarkSortButton={props.onClickBookmarkSortButton}
          onClickCommentSortButton={props.onClickCommentSortButton}
          onClickViewSortButton={props.onClickViewSortButton}
          onClickAccessTypeSortButton={props.onClickAccessTypeSortButton}
          onClickDateSortButton={props.onClickDateSortButton}
          onClickWorkTypeSortButton={props.onClickWorkTypeSortButton}
          onClickIsPromotionSortButton={props.onClickIsPromotionSortButton}
        />
        <CompactFilter
          filters={compactFilterValues}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleFiltersApply}
          isLoading={isLoading}
        />
        <div className="flex items-center space-x-2">
          <Switch
            onClick={() => props.setHasPrompt(props.hasPrompt === 1 ? 0 : 1)}
            checked={props.hasPrompt === 1}
          />
          <span className="text-sm">{t("プロンプト有", "With Prompts")}</span>
        </div>
      </div>

      {/* ────────── 表示モード ＆ 遷移モード ────────── */}
      <div className="flex justify-end gap-2">
        {/* フィード / ページネーション */}
        <Button
          variant={!isPagination ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("feed")}
          className="flex items-center space-x-1"
        >
          <List className="h-4 w-4" />
          <span>{t("フィード", "Feed")}</span>
        </Button>
        <Button
          variant={isPagination ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeChange("pagination")}
          className="flex items-center space-x-1"
        >
          <Grid className="h-4 w-4" />
          <span>{t("ページネーション", "Pagination")}</span>
        </Button>
        {/* リンク遷移 / ダイアログ */}
        <Separator orientation="vertical" />
        <div className="hidden gap-2 md:flex">
          <Button
            variant={!isDialogMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsDialogMode(false)}
            className="flex items-center space-x-1"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{t("リンク遷移", "Open page")}</span>
          </Button>
          <Button
            variant={isDialogMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsDialogMode(true)}
            className="flex items-center space-x-1"
          >
            <PlaySquare className="h-4 w-4" />
            <span>{t("ダイアログ", "Dialog")}</span>
          </Button>
        </div>
      </div>

      {/* ────────── メイン一覧 ────────── */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <span>{t("読み込み中...", "Loading...")}</span>
          </div>
        </div>
      ) : (
        <ResponsivePhotoWorksAlbum
          works={displayedWorks}
          isShowProfile={true}
          onSelect={isDialogMode ? openWork : undefined}
        />
      )}

      {/* 無限スクロール ローディング / 完了 */}
      {!isPagination && !isLoading && (
        <div ref={loadingRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              <span>{t("読み込み中...", "Loading...")}</span>
            </div>
          )}
          {!hasNextPage && infinitePages.flat().length > 0 && (
            <p className="text-muted-foreground">
              {t("すべての作品を表示しました", "All works have been displayed")}
            </p>
          )}
        </div>
      )}

      {/* ページネーション コントロール */}
      {isPagination && (
        <div className="-translate-x-1/2 fixed bottom-0 left-1/2 z-10 w-full border-border/40 bg-background/95 p-2 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80">
          <ResponsivePagination
            maxCount={Number(props.worksCount)}
            perPage={32}
            currentPage={props.page}
            onPageChange={(p: number) => {
              sessionStorage.setItem(
                `scroll-pagination-${stateKey}-${props.page}`,
                window.scrollY.toString(),
              )
              props.setPage(p)
            }}
          />
        </div>
      )}

      {/* ────────── 作品ダイアログ ────────── */}
      {workDialog.isOpen && workDialog.workId && (
        <WorkViewerDialog
          works={displayedWorks}
          startWorkId={workDialog.workId}
          onClose={workDialog.closeDialog}
          loadMore={!isPagination ? loadMore : undefined}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoadingMore}
        />
      )}
    </div>
  )
}
