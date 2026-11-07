import { useSearchParams } from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import {
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { AuthContext } from "~/contexts/auth-context"
import { useFollowFeedNewCount } from "~/hooks/use-follow-feed-new-count"
import { useLocale } from "~/hooks/use-locale"
import { useUpdateQueryParams } from "~/hooks/use-update-query-params"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"
import { useNavigate } from "~/lib/app/locale-router"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import type { HomeLoaderData } from "~/routes/($lang)._main._index/home-loader.server"
import { useHomeSidebar } from "~/routes/($lang)._main._index/hooks/use-home-sidebar"
import {
  buildHomeTabSearchParams,
  getInitialIsOneWorkPerUser,
  getInitialIsPagination,
  getInitialIsPromptPublic,
  getInitialPageValue,
  getInitialSortType,
  getInitialTimeRange,
  getInitialWorkType,
  getInitialWorkView,
} from "~/routes/($lang)._main._index/utils/home-search-params"
import {
  HOME_TAB_PATHS,
  type HomeTab,
} from "~/routes/($lang)._main._index/utils/home-tabs"

/**
 * ホームのタブ、絞り込み、ダイアログの状態と URL の同期
 */
export function useHomePageState(props: {
  data: HomeLoaderData
  forcedTab?: HomeTab
}) {
  const { data } = props

  const [searchParams, _setSearchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()
  const authContext = useContext(AuthContext)

  /** フォロー新着を最後に見てから増えた作品の数（タブに出す） */
  const followFeedNew = useFollowFeedNewCount()

  const markFollowFeedAsSeen = followFeedNew.markAsSeen

  const currentTab = props.forcedTab ?? "home"

  useEffect(() => {
    if (currentTab === "follow-user") {
      markFollowFeedAsSeen()
    }
  }, [currentTab, markFollowFeedAsSeen])

  const [isMounted, setIsMounted] = useState(false)

  const initialPage = getInitialPageValue(searchParams)
  const [newWorksPage, setNewWorksPage] = useState(
    currentTab === "new" ? initialPage : 0,
  )
  const [followUserFeedPage, setFollowUserFeedPage] = useState(
    currentTab === "follow-user" ? initialPage : 0,
  )
  const [followTagFeedPage, setFollowTagFeedPage] = useState(
    currentTab === "follow-tag" ? initialPage : 0,
  )

  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(
      getInitialWorkType(searchParams),
    )
  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(
    getInitialIsPromptPublic(searchParams),
  )
  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(
      getInitialSortType(searchParams),
    )
  const [isOneWorkPerUser, setIsOneWorkPerUser] = useState<boolean>(
    getInitialIsOneWorkPerUser(searchParams),
  )

  const navigate = useNavigate()

  // 期間指定の state
  const [timeRange, setTimeRange] = useState<string>(
    getInitialTimeRange(searchParams),
  )

  const location = useLocale()

  // 新着タブ内（「新着 / 人気 / 新規ユーザ」）切り替え
  const [workView, setWorkView] = useState(getInitialWorkView(searchParams))

  const [internalIsPagination, setInternalIsPagination] = useState(
    getInitialIsPagination(searchParams),
  )

  // 絞り込み中の数（0 なら絞り込み欄は閉じておき、作品をすぐ見られるようにする）
  const activeFilterCount = [
    workType !== null,
    isPromptPublic !== null,
    sortType !== null && sortType !== "DATE_CREATED",
    isOneWorkPerUser,
    timeRange !== "ALL",
  ].filter(Boolean).length
  const [isFilterUiOpen, setIsFilterUiOpen] = useState(activeFilterCount > 0)

  // 作品遷移モード（ダイアログ / 直接リンク）
  const [isDialogMode, setIsDialogMode] = useState(false)

  // Work dialog URL state management
  const workDialog = useWorkDialogUrl()

  // 作品データの管理用state
  const [currentWorks, setCurrentWorks] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[]
  >([])
  const [homeSectionWorks, setHomeSectionWorks] = useState({
    generated: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
    newUsers: (data?.newUserWorks ?? []) as FragmentOf<
      typeof PhotoAlbumWorkFragment
    >[],
    recommended: (data?.promotionWorks ?? []) as FragmentOf<
      typeof PhotoAlbumWorkFragment
    >[],
    tags: [
      ...(data?.firstTagWorks ?? []),
      ...(data?.secondTagWorks ?? []),
    ] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  })

  const onChangePaginationMode = (isPagination: boolean) => {
    setInternalIsPagination(isPagination)
    const p = new URLSearchParams(searchParams)
    p.set("isPagination", isPagination ? "true" : "false")
    updateQueryParams(p)
  }

  const onChangeDialogMode = (mode: boolean) => {
    setIsDialogMode(mode)
    if (!mode) {
      workDialog.closeDialog()
    }

    // ローカルストレージに保存
    if (typeof window !== "undefined") {
      localStorage.setItem("aipictors-dialog-mode", JSON.stringify(mode))
    }
  }

  // ホームタブ用の作品データを管理するstate
  const homeWorks = useMemo(() => {
    const works = [
      ...homeSectionWorks.recommended,
      ...homeSectionWorks.generated,
      ...homeSectionWorks.newUsers,
      ...homeSectionWorks.tags,
    ]

    return works.filter(
      (work, index, self) =>
        self.findIndex((target) => target.id === work.id) === index,
    )
  }, [homeSectionWorks])

  const updateHomeSectionWorks = (
    section: keyof typeof homeSectionWorks,
    works: FragmentOf<typeof PhotoAlbumWorkFragment>[],
  ) => {
    setHomeSectionWorks((prev) => {
      const isSameWorks =
        prev[section].length === works.length &&
        prev[section].every((work, index) => work.id === works[index]?.id)

      if (isSameWorks) {
        return prev
      }

      return {
        ...prev,
        [section]: works,
      }
    })
  }

  /**
   * マウント時の初期化（状態はすでに初期値で設定済み）
   */
  useEffect(() => {
    if (!isMounted) {
      // hydration 中の Suspense より後に回す（急ぎの更新だと React error #421 で作り直しになる）
      startTransition(() => setIsMounted(true))
    }
  }, [isMounted])

  // タブ変更時（Tabs の onValueChange）などで呼ばれる
  const handleTabChange = (tab: string) => {
    if (
      tab === "recommended" ||
      tab === "home" ||
      tab === "new" ||
      tab === "follow-user" ||
      tab === "follow-tag"
    ) {
      navigate(HOME_TAB_PATHS[tab])
    }
  }

  /**
   * タブ or ページ番号の変更時にクエリパラメータを更新
   */
  useEffect(() => {
    if (!isMounted) return
    const newSearchParams = new URLSearchParams(searchParams)

    buildHomeTabSearchParams(newSearchParams, {
      currentTab,
      newWorksPage,
      followUserFeedPage,
      followTagFeedPage,
      timeRange,
      workView,
      internalIsPagination,
      isOneWorkPerUser,
    })

    updateQueryParams(newSearchParams)
  }, [
    currentTab,
    newWorksPage,
    followUserFeedPage,
    followTagFeedPage,
    isMounted,
    timeRange,
    isOneWorkPerUser,
    workView,
    updateQueryParams,
    searchParams,
    internalIsPagination,
  ])

  /**
   * ダイアログモードの設定をローカルストレージから復元
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedDialogMode = localStorage.getItem("aipictors-dialog-mode")
        if (savedDialogMode !== null) {
          const parsedMode = JSON.parse(savedDialogMode)
          if (typeof parsedMode === "boolean") {
            setIsDialogMode(parsedMode)
          }
        }
      } catch (error) {
        console.warn("Failed to parse dialog mode from localStorage:", error)
      }
    }
  }, [])

  // URLパラメータの変更は初期化時のuseEffectで処理されるため、この処理は削除

  /**
   * 新着タブ内の「新着 / 人気 / 新規ユーザ」切り替え
   */
  const handleWorkViewChange = (view: string) => {
    setWorkView(view)
    const newSearchParams = new URLSearchParams(searchParams)
    if (view === "new") {
      newSearchParams.delete("view")
    } else {
      newSearchParams.set("view", view)
    }
    updateQueryParams(newSearchParams)
  }

  // workType チェンジ
  const handleWorkTypeChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === "ALL") {
      newSearchParams.delete("workType")
      setWorkType(null)
    } else {
      newSearchParams.set("workType", value)
      setWorkType(value as IntrospectionEnum<"WorkType">)
    }

    // ページリセット
    newSearchParams.delete("page")
    setNewWorksPage(0)

    updateQueryParams(newSearchParams)
  }

  // プロンプト公開有無
  const handlePromptChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === "ALL") {
      newSearchParams.delete("isPromptPublic")
      setIsPromptPublic(null)
    } else {
      const isPrompt = value === "prompt"
      newSearchParams.set("isPromptPublic", isPrompt ? "true" : "false")
      setIsPromptPublic(isPrompt)
    }

    updateQueryParams(newSearchParams)
  }

  // ソート
  const handleSortTypeChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    if (value === "ALL") {
      newSearchParams.delete("sortType")
      setSortType(null)
    } else {
      newSearchParams.set("sortType", value)
      setSortType(value as IntrospectionEnum<"WorkOrderBy">)
    }

    updateQueryParams(newSearchParams)
  }

  // 期間指定
  const handleTimeRangeChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams)

    setTimeRange(value)
    if (value === "ALL") {
      newSearchParams.delete("timeRange")
    } else {
      newSearchParams.set("timeRange", value)
    }

    updateQueryParams(newSearchParams)
  }

  const sidebar = useHomeSidebar({ currentTab, isMounted, data })

  const [hasNextPage, _setHasNextPage] = useState(true)
  const [isLoadingMore, _setIsLoadingMore] = useState(false)

  // ダイアログで表示する作品データを決定
  const displayedWorks = useMemo(() => {
    switch (currentTab) {
      case "home":
        return homeWorks
      case "new":
      case "follow-user":
      case "follow-tag":
        return currentWorks
      default:
        return []
    }
  }, [currentTab, homeWorks, currentWorks])

  // 作品クリック時の処理
  const openWork = (idx: string) => {
    console.log("Opening work with index:", idx)
    // displayedWorksのworkのid一致するもの
    const work = displayedWorks.find((w) => w.id === idx)
    if (!work) {
      console.error("Work not found for ID:", idx)
      return
    }
    if (isDialogMode) {
      console.log("Opening dialog for work ID:", idx)
      workDialog.openDialog(idx)
    } else {
      console.log("Navigating to:", `/posts/${work.id}`)
      navigate(`/posts/${work.id}`)
    }
  }

  // currentWorksを更新するコールバック関数
  const updateCurrentWorks = (
    works: FragmentOf<typeof PhotoAlbumWorkFragment>[],
  ) => {
    setCurrentWorks(works)
  }

  // 無限スクロール用のloadMore関数
  const loadMore = async () => {
    if (isLoadingMore || !hasNextPage || internalIsPagination) return
  }

  return {
    authContext,
    currentTab,
    followFeedNew,
    location,
    searchParams,
    updateQueryParams,
    workDialog,
    displayedWorks,
    openWork,
    updateCurrentWorks,
    updateHomeSectionWorks,
    loadMore,
    hasNextPage,
    isLoadingMore,
    handleTabChange,
    handleWorkViewChange,
    handleWorkTypeChange,
    handlePromptChange,
    handleSortTypeChange,
    handleTimeRangeChange,
    onChangePaginationMode,
    onChangeDialogMode,
    newWorksPage,
    setNewWorksPage,
    followUserFeedPage,
    setFollowUserFeedPage,
    followTagFeedPage,
    setFollowTagFeedPage,
    workType,
    isPromptPublic,
    sortType,
    isOneWorkPerUser,
    setIsOneWorkPerUser,
    timeRange,
    workView,
    internalIsPagination,
    setInternalIsPagination,
    activeFilterCount,
    isFilterUiOpen,
    setIsFilterUiOpen,
    isDialogMode,
    sidebar,
  }
}

export type HomePageState = ReturnType<typeof useHomePageState>
