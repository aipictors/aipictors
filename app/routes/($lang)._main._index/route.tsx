import { useMutation, useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { json, redirect } from "@remix-run/cloudflare"
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import type { FragmentOf } from "gql.tada"
import { graphql } from "gql.tada"
import {
  ArrowDownWideNarrow,
  ExternalLink,
  List,
  Minus,
  Navigation,
  PlaySquare,
  Plus,
} from "lucide-react"
import {
  Suspense,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Skeleton } from "~/components/ui/skeleton"
import { Tabs, TabsContent } from "~/components/ui/tabs"
import { WorkViewerDialog } from "~/components/work/work-viewer-dialog"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import { useUpdateQueryParams } from "~/hooks/use-update-query-params"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { FollowTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-tags-feed-contents"
import { FollowUserFeedContents } from "~/routes/($lang)._main._index/components/follow-user-feed-contents"
import {
  HomeAwardWorkSection,
  HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeAwardWorksFragment,
  HomeAwardWorksSection,
} from "~/routes/($lang)._main._index/components/home-award-works"
import {
  HomeDeferredSection,
  HomeWorkSectionPlaceholder,
} from "~/routes/($lang)._main._index/components/home-deferred-section"
import { HomeNovelsWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-novels-works-section"
import type { HomePreviewEvent } from "~/routes/($lang)._main._index/components/home-event-preview-list"
import { HomeHotWorksSection } from "~/routes/($lang)._main._index/components/home-hot-works-section"
import { HomeLoginNoticeMarquee } from "~/routes/($lang)._main._index/components/home-login-notice-marquee"
import {
  HomeNewCommentsFragment,
  HomeNewCommentsSection,
} from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewUsersWorkListSection } from "~/routes/($lang)._main._index/components/home-new-user-work-list-section"
import {
  HomeNewPostedUsersFragment,
  HomeNewUsersSection,
} from "~/routes/($lang)._main._index/components/home-new-users-section"
import { HomeNewUsersWorksSection } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeNewWorksSkeleton } from "~/routes/($lang)._main._index/components/home-new-works-skeleton"
import { HomePaginationWorksSection } from "~/routes/($lang)._main._index/components/home-pagination-works-section"
import { HomeQuickPreviewBar } from "~/routes/($lang)._main._index/components/home-quick-preview-bar"
import {
  HomeTagList,
  HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeTagFragment,
  HomeTagsSection,
} from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomeVideosWorkListItemFragment } from "~/routes/($lang)._main._index/components/home-video-works-section"
import { HomeWorksGeneratedSection } from "~/routes/($lang)._main._index/components/home-works-generated-section"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import { HomeWorksTagSection } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomeWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeWorkFragment } from "~/routes/($lang)._main._index/components/home-work-section"
import type {
  MicroCmsApiRelease,
  MicroCmsApiReleaseResponse,
} from "~/types/micro-cms-release-response"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"
import {
  fetchFeaturedTaggedReleases,
  fetchReleaseList,
} from "~/utils/micro-cms-release"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { PER_IMG } from "~/routes/($lang)._main._index/utils/works-utils"

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME, undefined, props.params.lang)
}

export type HomeTab = "home" | "new" | "follow-user" | "follow-tag"

export const HOME_TAB_PATHS: Record<HomeTab, string> = {
  home: "/home",
  new: "/",
  "follow-user": "/follow-user-works",
  "follow-tag": "/follow-tag-works",
}

const getUtcDateString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2)
  const day = `0${date.getUTCDate()}`.slice(-2)

  return `${year}/${month}/${day}`
}

const normalizeOfficialHomePreviewEvent = (event: any): HomePreviewEvent => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  thumbnailImageUrl: event.thumbnailImageUrl,
  status: event.status,
  startAt: event.startAt,
  endAt: event.endAt,
  isOfficial: true,
  rankingEnabled: false,
  entryCount: event.worksCount ?? 0,
  participantCount: 0,
  tags: event.tag ? [event.tag] : [],
  userIconUrl: null,
  userName: "Aipictors",
})

const normalizeUserHomePreviewEvent = (event: any): HomePreviewEvent => ({
  id: event.id,
  slug: event.slug,
  title: event.title,
  thumbnailImageUrl:
    event.thumbnailImageUrl || event.headerImageUrl || "/images/opepnepe.png",
  status: event.status,
  startAt: event.startAt,
  endAt: event.endAt,
  isOfficial: false,
  rankingEnabled: event.rankingEnabled,
  entryCount: event.entryCount,
  participantCount: event.participantCount,
  tags: [event.mainTag, ...(event.tags ?? [])].filter(Boolean),
  userIconUrl: event.userIconUrl ?? null,
  userName: event.userName,
})

const shuffleArray = <T,>(items: T[]) => {
  const copied = [...items]

  for (let index = copied.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copied[index], copied[randomIndex]] = [copied[randomIndex], copied[index]]
  }

  return copied
}

const isHomePreviewTargetStatus = (status: string) => {
  return status === "ONGOING" || status === "UPCOMING"
}

const buildHomeEventPreviews = (officialEvents: any[], userEvents: any[]) => {
  return shuffleArray([
    ...officialEvents
      .filter((event) => isHomePreviewTargetStatus(event.status))
      .map(normalizeOfficialHomePreviewEvent),
    ...userEvents
      .filter((event) => isHomePreviewTargetStatus(event.status))
      .map(normalizeUserHomePreviewEvent),
  ])
}

const createEmptyReleaseList = (): MicroCmsApiReleaseResponse => ({
  contents: [],
  totalCount: 0,
  offset: 0,
  limit: 4,
})

const createBaseHomeLoaderData = (props: {
  awardDateText: string
  firstTag: string
  secondTag: string
  releaseList: MicroCmsApiReleaseResponse
  featuredReleaseList: MicroCmsApiRelease[]
}) => ({
  awardDateText: props.awardDateText,
  dailyTheme: null,
  eventPreviews: [] as HomePreviewEvent[],
  firstTag: props.firstTag,
  featuredReleaseList: props.featuredReleaseList,
  hotTags: [] as FragmentOf<typeof HomeTagListItemFragment>[],
  initialNewWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  newComments: [] as FragmentOf<typeof HomeNewCommentsFragment>[],
  newPostedUsers: [] as FragmentOf<typeof HomeNewPostedUsersFragment>[],
  newUserWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  promotionWorks: [] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
  recommendedTags: [] as FragmentOf<typeof HomeTagFragment>[],
  releaseList: props.releaseList,
  secondTag: props.secondTag,
  secondTagWorks: [] as FragmentOf<typeof HomeTagWorkFragment>[],
  workAwards: [] as FragmentOf<typeof HomeWorkAwardFragment>[],
  firstTagWorks: [] as FragmentOf<typeof HomeTagWorkFragment>[],
})

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const legacyTab = url.searchParams.get("tab")
  const currentPathLeaf = url.pathname.split("/").filter(Boolean).at(-1) ?? ""
  const isHomeRoute = currentPathLeaf === "home"
  const isFollowUserRoute = currentPathLeaf === "follow-user-works"
  const isFollowTagRoute = currentPathLeaf === "follow-tag-works"
  const isDefaultTopRoute =
    !isHomeRoute && !isFollowUserRoute && !isFollowTagRoute

  if (
    legacyTab === "home" ||
    legacyTab === "new" ||
    legacyTab === "follow-user" ||
    legacyTab === "follow-tag"
  ) {
    url.pathname = HOME_TAB_PATHS[legacyTab]
    url.searchParams.delete("tab")

    return redirect(`${url.pathname}${url.search}`, { status: 302 })
  }

  const categories = ["ゆめかわ", "ダークソウル", "パステル", "ちびキャラ"]

  const getRandomCategories = () => {
    const currentTime = new Date()
    const secondSeed = Math.floor(currentTime.getTime() / 1000)

    const seededRandom = (seed: number, str: string) => {
      const combined = seed + str.charCodeAt(0)
      const x = Math.sin(combined) * 10000
      return x - Math.floor(x)
    }

    const randomCategories = categories
      .map((cat) => ({
        cat,
        sortKey: seededRandom(secondSeed, cat),
      }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .slice(0, 2)
      .map((item) => item.cat)

    return randomCategories
  }

  const randomCategories = getRandomCategories()

  const now = getJstDate()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const awardDateText = getUtcDateString(yesterday)

  const [releaseList, featuredReleaseList] = await Promise.all([
    fetchReleaseList({
      limit: 4,
    }).catch(() => ({
      contents: [],
      totalCount: 0,
      offset: 0,
      limit: 4,
    })),
    fetchFeaturedTaggedReleases().catch(() => []),
  ])

  const safeReleaseList =
    releaseList && Array.isArray(releaseList.contents)
      ? releaseList
      : createEmptyReleaseList()

  const baseLoaderData = createBaseHomeLoaderData({
    awardDateText,
    firstTag: randomCategories[0],
    secondTag: randomCategories[1],
    releaseList: safeReleaseList,
    featuredReleaseList: Array.isArray(featuredReleaseList)
      ? featuredReleaseList
      : [],
  })

  if (!isHomeRoute) {
    if (!isDefaultTopRoute) {
      return json(baseLoaderData, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      })
    }

    const initialWorksResult = await loaderClient.query({
      query: initialNewWorksQuery,
      errorPolicy: "all",
      variables: {
        limit: PER_IMG,
        offset: 0,
        where: {
          beforeCreatedAt: new Date().toISOString(),
          isNowCreatedAt: true,
          orderBy: "DATE_CREATED",
          ratings: ["G", "R15"],
        },
      },
    })

    return json(
      {
        ...baseLoaderData,
        initialNewWorks: Array.isArray(initialWorksResult.data?.works)
          ? initialWorksResult.data.works
          : [],
      },
      {
        headers: {
          "Cache-Control": config.cacheControl.home,
        },
      },
    )
  }

  const result = await loaderClient.query({
    query: query,
    errorPolicy: "all",
    variables: {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  })

  const resultData = result.data
  const appEvents: any[] = Array.isArray(resultData?.appEvents)
    ? resultData.appEvents
    : []
  const userEvents: any[] = Array.isArray(resultData?.userEvents)
    ? resultData.userEvents
    : []
  const eventPreviews = buildHomeEventPreviews(appEvents, userEvents)

  return json(
    {
      ...baseLoaderData,
      ...(resultData ?? {}),
      eventPreviews,
      hotTags: Array.isArray(resultData?.hotTags) ? resultData.hotTags : [],
      recommendedTags: Array.isArray(resultData?.recommendedTags)
        ? resultData.recommendedTags
        : [],
    },
    {
      headers: {
        "Cache-Control": config.cacheControl.home,
      },
    },
  )
}

// カスタムフック: スクロール位置の保存・復元（windowオブジェクトを使用しない）
function useScrollRestoration(isMounted: boolean) {
  useEffect(() => {
    if (isMounted) {
      // スクロール位置の復元を行わない（React Routerが自動的に保持する場合）
    }
  }, [isMounted])
}

type HomeIndexPageProps = {
  forcedTab?: HomeTab
}

export function HomeIndexPage(props: HomeIndexPageProps = {}) {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()
  const checkboxId = useId()

  const [searchParams, _setSearchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()
  const authContext = useContext(AuthContext)

  const currentTab = props.forcedTab ?? "new"

  // URLパラメータから初期値を取得する関数（SSR対応）
  const getInitialPageValue = () => {
    if (typeof window === "undefined") return 0
    const page = searchParams.get("page")
    const pageNumber = page ? Number.parseInt(page, 10) : 0
    return !Number.isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= 100
      ? pageNumber
      : 0
  }

  const getInitialWorkType = () => {
    if (typeof window === "undefined") return null
    const wtParam = searchParams.get("workType")
    return wtParam && wtParam !== "ALL"
      ? (wtParam as IntrospectionEnum<"WorkType">)
      : null
  }

  const getInitialIsPromptPublic = () => {
    if (typeof window === "undefined") return null
    const isPromptParam = searchParams.get("isPromptPublic")
    if (isPromptParam === "true") return true
    if (isPromptParam === "false") return false
    return null
  }

  const getInitialSortType = () => {
    if (typeof window === "undefined") return null
    const sortTypeParam = searchParams.get("sortType")
    if (
      sortTypeParam === "DATE_CREATED" ||
      sortTypeParam === "LIKES_COUNT" ||
      sortTypeParam === "COMMENTS_COUNT"
    ) {
      return sortTypeParam as IntrospectionEnum<"WorkOrderBy">
    }
    return null
  }

  const getInitialTimeRange = () => {
    if (typeof window === "undefined") return "ALL"
    const tr = searchParams.get("timeRange")
    return tr && tr !== "ALL" ? tr : "ALL"
  }

  const getInitialIsOneWorkPerUser = () => {
    if (typeof window === "undefined") return false
    const isOneWorkPerUserParam = searchParams.get("isOneWorkPerUser")
    return isOneWorkPerUserParam === "true"
  }

  const getInitialWorkView = () => {
    if (typeof window === "undefined") return "new"
    const viewParam = searchParams.get("view")
    return viewParam || "new"
  }

  const getInitialIsPagination = () => {
    if (typeof window === "undefined") return true
    const isPaginationParam = searchParams.get("isPagination")
    if (isPaginationParam === "false") return false
    return true
  }

  const [isMounted, setIsMounted] = useState(false)

  const initialPage = getInitialPageValue()
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
    useState<IntrospectionEnum<"WorkType"> | null>(getInitialWorkType())
  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(
    getInitialIsPromptPublic(),
  )
  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(getInitialSortType())
  const [isOneWorkPerUser, setIsOneWorkPerUser] = useState<boolean>(
    getInitialIsOneWorkPerUser(),
  )

  const navigate = useNavigate()

  // 期間指定の state
  const [timeRange, setTimeRange] = useState<string>(getInitialTimeRange())

  const location = useLocale()

  // 新着タブ内（「新着 / 人気 / 新規ユーザ」）切り替え
  const [workView, setWorkView] = useState(getInitialWorkView())

  const [internalIsPagination, setInternalIsPagination] = useState(
    getInitialIsPagination(),
  )

  const [isFilterUiOpen, setIsFilterUiOpen] = useState(true)

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
  const homeWorks = useMemo(
    () => {
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
    },
    [homeSectionWorks],
  )

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
      setIsMounted(true)
    }
  }, [isMounted])

  // タブ変更時（Tabs の onValueChange）などで呼ばれる
  const handleTabChange = (tab: string) => {
    if (
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

    // ページ
    if (currentTab === "new") {
      if (newWorksPage === 0) {
        newSearchParams.delete("page")
      } else {
        newSearchParams.set("page", newWorksPage.toString())
      }
    } else if (currentTab === "follow-user") {
      if (followUserFeedPage === 0) {
        newSearchParams.delete("page")
      } else {
        newSearchParams.set("page", followUserFeedPage.toString())
      }
    } else if (currentTab === "follow-tag") {
      if (followTagFeedPage === 0) {
        newSearchParams.delete("page")
      } else {
        newSearchParams.set("page", followTagFeedPage.toString())
      }
    } else {
      newSearchParams.delete("page")
    }

    // 期間指定
    if (currentTab === "new") {
      if (timeRange === "ALL") {
        newSearchParams.delete("timeRange")
      } else {
        newSearchParams.set("timeRange", timeRange)
      }
    } else {
      newSearchParams.delete("timeRange")
    }

    if (currentTab === "new") {
      if (workView === "new") {
        newSearchParams.delete("view")
      } else {
        newSearchParams.set("view", workView)
      }
    } else {
      newSearchParams.delete("view")
    }

    if (internalIsPagination) {
      newSearchParams.delete("isPagination")
    } else {
      newSearchParams.set("isPagination", "false")
    }

    // ユーザー毎に1作品フィルター
    if (currentTab === "new") {
      if (isOneWorkPerUser) {
        newSearchParams.set("isOneWorkPerUser", "true")
      } else {
        newSearchParams.delete("isOneWorkPerUser")
      }
    } else {
      newSearchParams.delete("isOneWorkPerUser")
    }

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

  const shouldLoadHomeSidebarQueries =
    currentTab === "home" && typeof window !== "undefined"

  const awardDateParts = data.awardDateText.split("/")
  const awardYear = Number(awardDateParts[0] ?? "0")
  const awardMonth = Number(awardDateParts[1] ?? "0")
  const awardDay = Number(awardDateParts[2] ?? "0")

  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: !shouldLoadHomeSidebarQueries,
    fetchPolicy: "cache-first",
  })
  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    skip: !shouldLoadHomeSidebarQueries,
    fetchPolicy: "cache-first",
    variables: {
      where: {
        isSensitive: false,
        page: "work",
      },
    },
  })
  const [updateClickedCountCustomerAdvertisement] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )
  const { data: homeSidebarData, loading: isHomeSidebarLoading } = useQuery(
    homeSidebarQuery,
    {
      skip: !shouldLoadHomeSidebarQueries,
      fetchPolicy: "cache-first",
      variables: {
        awardDay,
        awardMonth,
        awardYear,
        awardWorksLimit: config.query.homeWorkCount.award,
      },
    },
  )

  const onClickAdvertisement = async () => {
    if (advertisements?.randomCustomerAdvertisement) {
      await updateClickedCountCustomerAdvertisement({
        variables: {
          id: advertisements.randomCustomerAdvertisement.id,
        },
      })
    }
  }

  const passData = pass?.viewer?.currentPass
  const isSubscriptionUser =
    passData?.type === "LITE" ||
    passData?.type === "STANDARD" ||
    passData?.type === "PREMIUM"
  const sidebarNewPostedUsers = (
    Array.isArray(homeSidebarData?.newPostedUsers)
      ? homeSidebarData.newPostedUsers
      : data.newPostedUsers
  ) as FragmentOf<typeof HomeNewPostedUsersFragment>[]
  const sidebarNewComments = (
    Array.isArray(homeSidebarData?.newComments)
      ? homeSidebarData.newComments
      : data.newComments
  ) as FragmentOf<typeof HomeNewCommentsFragment>[]
  const sidebarWorkAwards = (
    Array.isArray(homeSidebarData?.workAwards)
      ? homeSidebarData.workAwards
      : data.workAwards
  ) as FragmentOf<
    typeof HomeAwardWorksFragment | typeof HomeWorkAwardFragment
  >[]

  // スクロール位置復元しない
  useScrollRestoration(isMounted)

  const [hasNextPage, _setHasNextPage] = useState(true)
  const [isLoadingMore, _setIsLoadingMore] = useState(false)

  const loginNoticeReleases = useMemo(() => {
    const mergedReleases = [
      ...data.featuredReleaseList,
      ...data.releaseList.contents,
    ]

    return mergedReleases.filter((release, index, array) => {
      return array.findIndex((item) => item.id === release.id) === index
    })
  }, [data.featuredReleaseList, data.releaseList.contents])

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

  if (data === null) {
    return null
  }

  return (
    <>
      <Tabs
        value={currentTab}
        defaultValue={currentTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        {authContext.isLoggedIn && (
          <HomeLoginNoticeMarquee releases={loginNoticeReleases} />
        )}
        {/* ヘッダー部分: タブ */}
        <div className="-mx-4 bg-background/98 px-4 py-2">
          <div className="flex items-center justify-between gap-x-3 md:gap-x-6">
            <div className="min-w-0 flex-1">
              <AppAnimatedTabs
                tabs={[
                  { label: "ホーム", value: "home" },
                  { label: "新着・人気", value: "new" },
                  { label: "フォロー新着", value: "follow-user" },
                  { label: "お気に入りタグ新着", value: "follow-tag" },
                ]}
                value={currentTab}
                onChange={handleTabChange}
              />
            </div>
          </div>
        </div>
        {/* ---------------------- タブ: ホーム ---------------------- */}
        <TabsContent value="home" className="m-0 flex flex-col space-y-4">
          <Suspense fallback={<AppLoadingPage />}>
            {data.dailyTheme && (
              <div>
                <HomeTagList
                  themeTitle={data.dailyTheme.title}
                  hotTags={data.hotTags}
                />
              </div>
            )}
          </Suspense>
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            <div className="flex w-full min-w-0 flex-col space-y-4 overflow-hidden md:max-w-[calc(100%_-_262px)]">
              <HomeQuickPreviewBar
                events={data.eventPreviews}
                featuredReleases={data.featuredReleaseList}
                releaseList={data.releaseList}
              />
              <HomeDeferredSection
                fallback={
                  <HomeWorkSectionPlaceholder
                    title={t("ユーザからの推薦", "Recommended by users")}
                  />
                }
              >
                <HomeWorksUsersRecommendedSection
                  works={[]}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                  onWorksLoaded={(works) => updateHomeSectionWorks("recommended", works)}
                />
              </HomeDeferredSection>
              <HomeDeferredSection
                fallback={
                  <HomeWorkSectionPlaceholder
                    title={t("作品を選んで無料生成", "Generate from featured works")}
                  />
                }
              >
                <HomeWorksGeneratedSection
                  works={[]}
                  dateText={data.awardDateText}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                  onWorksLoaded={(works) => updateHomeSectionWorks("generated", works)}
                />
              </HomeDeferredSection>
              <HomeDeferredSection
                fallback={
                  <HomeWorkSectionPlaceholder
                    title={t("新規クリエイターの初投稿作品", "New creators' first works")}
                    variant="cropped"
                  />
                }
              >
                <HomeNewUsersWorksSection
                  works={[]}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                  onWorksLoaded={(works) => updateHomeSectionWorks("newUsers", works)}
                />
              </HomeDeferredSection>
              <HomeDeferredSection
                fallback={
                  <HomeWorkSectionPlaceholder
                    title={t("前日ランキング", "Previous Day Ranking")}
                    variant="cropped"
                  />
                }
              >
                <HomeAwardWorkSection
                  awardDateText={data.awardDateText}
                  title={t("前日ランキング", "Previous Day Ranking")}
                  awards={[]}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                />
              </HomeDeferredSection>
              <HomeDeferredSection
                fallback={
                  <HomeWorkSectionPlaceholder
                    title={t("タグ作品", "Tag Works")}
                    variant="cropped"
                  />
                }
              >
                <HomeWorksTagSection
                  tag={data.firstTag}
                  works={[]}
                  secondTag={data.secondTag}
                  secondWorks={[]}
                  isCropped={true}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                  onWorksLoaded={(works) => updateHomeSectionWorks("tags", works)}
                />
              </HomeDeferredSection>
              <HomeTagsSection
                title={t("人気タグ", "Popular Tags")}
                tags={data.recommendedTags}
              />
            </div>
            <Separator
              orientation="vertical"
              className="hidden h-[100vh] w-[1px] md:block"
            />
            <div className="flex w-full max-w-80 flex-col space-y-4">
              <div className="flex w-full flex-col space-y-4">
                {!isSubscriptionUser &&
                  advertisements &&
                  advertisements.randomCustomerAdvertisement && (
                    <div className="relative border">
                      <Link
                        onClick={onClickAdvertisement}
                        target="_blank"
                        to={advertisements.randomCustomerAdvertisement.url}
                      >
                        <img
                          src={
                            advertisements.randomCustomerAdvertisement.imageUrl
                          }
                          alt="Advertisement"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                          className="h-auto w-full"
                        />
                      </Link>
                      <div className="absolute top-0 right-0">
                        <CrossPlatformTooltip
                          text={t(
                            "提携広告です、広告主様を募集中です。メールまたはDMにてご連絡ください。",
                            "This is a partnered advertisement. We are accepting new advertisers. Please contact us via email or DM.",
                          )}
                        />
                      </div>
                    </div>
                  )}
                {!isSubscriptionUser && (
                  <Link to="/generation">
                    <img
                      src="https://assets.aipictors.com/Aipictors_01.webp"
                      alt="Aipictors Logo"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-auto w-full"
                    />
                  </Link>
                )}
                {isHomeSidebarLoading &&
                  sidebarNewPostedUsers.length === 0 &&
                  sidebarNewComments.length === 0 &&
                  sidebarWorkAwards.length === 0 && (
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  )}
                {sidebarNewPostedUsers.length > 0 && (
                  <HomeNewUsersSection users={sidebarNewPostedUsers} />
                )}
                {sidebarNewComments.length > 0 && (
                  <HomeNewCommentsSection comments={sidebarNewComments} />
                )}
                {sidebarWorkAwards.length > 0 && (
                  <HomeAwardWorksSection works={sidebarWorkAwards} />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
        {/* ---------------------- タブ: 新着・人気 ---------------------- */}
        <TabsContent value="new" className="flex flex-col space-y-4">
          {/* 新着 or 人気 or 新規ユーザの切り替えボタン */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={workView === "new" ? "default" : "outline"}
              onClick={() => handleWorkViewChange("new")}
              size="sm"
              className="font-medium shadow-sm transition-shadow hover:shadow"
            >
              {t("新着", "New")}
            </Button>
            <Button
              variant={workView === "popular" ? "default" : "outline"}
              onClick={() => handleWorkViewChange("popular")}
              size="sm"
              className="font-medium shadow-sm transition-shadow hover:shadow"
            >
              <div className="flex items-center space-x-1.5">
                <span>{t("人気", "Popular")}</span>
                <CrossPlatformTooltip
                  text={t(
                    "最近投稿された人気作品が表示されます",
                    "Recently popular works",
                  )}
                />
              </div>
            </Button>
            <Button
              variant={workView === "new-user" ? "default" : "outline"}
              onClick={() => handleWorkViewChange("new-user")}
              size="sm"
              className="font-medium shadow-sm transition-shadow hover:shadow"
            >
              <div className="flex items-center space-x-1.5">
                <span className="hidden sm:inline">
                  {t("新規ユーザ", "New Users")}
                </span>
                <span className="inline sm:hidden">{t("新規", "New")}</span>
                <CrossPlatformTooltip
                  text={t(
                    "新規登録されたユーザの作品一覧です",
                    "List of works by newly registered users",
                  )}
                />
              </div>
            </Button>
          </div>

          {workView === "new" && (
            <div className="space-y-4">
              {/* 絞り込み用のセレクト群 - レスポンシブレイアウト */}
              <div className="rounded-lg bg-muted/30 p-2">
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setIsFilterUiOpen((v) => !v)}
                    aria-label={
                      isFilterUiOpen
                        ? t("絞り込みを閉じる", "Close filters")
                        : t("絞り込みを開く", "Open filters")
                    }
                  >
                    {isFilterUiOpen ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isFilterUiOpen && (
                  <div className="space-y-2">
                    {/* フィルター行1: 種類、プロンプト、ソート */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* 種類 */}
                      <Select
                        value={workType ? workType : ""}
                        onValueChange={handleWorkTypeChange}
                      >
                        <SelectTrigger className="h-8 w-full min-w-0 font-medium text-xs">
                          <SelectValue
                            placeholder={
                              workType
                                ? toWorkTypeText({
                                    type: workType,
                                    lang: location,
                                  })
                                : t("種類", "Type")
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">
                            {t("種類", "Type")}
                          </SelectItem>
                          <SelectItem value="WORK">
                            {t("画像", "Image")}
                          </SelectItem>
                          <SelectItem value="VIDEO">
                            {t("動画", "Video")}
                          </SelectItem>
                          <SelectItem value="NOVEL">
                            {t("小説", "Novel")}
                          </SelectItem>
                          <SelectItem value="COLUMN">
                            {t("コラム", "Column")}
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* プロンプト有無 */}
                      <Select
                        value={
                          isPromptPublic === null
                            ? "ALL"
                            : isPromptPublic
                              ? "prompt"
                              : "no-prompt"
                        }
                        onValueChange={handlePromptChange}
                      >
                        <SelectTrigger className="h-8 w-full min-w-0 font-medium text-xs">
                          <SelectValue
                            placeholder={
                              isPromptPublic === null
                                ? t("プロンプト", "Prompt")
                                : isPromptPublic
                                  ? t("あり", "Yes")
                                  : t("なし", "No")
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">
                            {t("プロンプト", "Prompt")}
                          </SelectItem>
                          <SelectItem value="prompt">
                            {t("あり", "Yes")}
                          </SelectItem>
                          <SelectItem value="no-prompt">
                            {t("なし", "No")}
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* ソート */}
                      <Select
                        value={sortType ? sortType : ""}
                        onValueChange={handleSortTypeChange}
                      >
                        <SelectTrigger className="h-8 w-full min-w-0 font-medium text-xs">
                          <ArrowDownWideNarrow className="h-3.5 w-3.5" />
                          <SelectValue
                            placeholder={
                              sortType ? sortType : t("最新", "Latest")
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DATE_CREATED">
                            {t("最新", "Latest")}
                          </SelectItem>
                          <SelectItem value="LIKES_COUNT">
                            {t("人気", "Popular")}
                          </SelectItem>
                          <SelectItem value="COMMENTS_COUNT">
                            {t("コメント", "Comments")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* フィルター行2: 期間指定とチェックボックス */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 左側: 期間指定とチェックボックス */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 期間指定 */}
                        <Select
                          value={timeRange}
                          onValueChange={handleTimeRangeChange}
                        >
                          <SelectTrigger className="h-8 w-full font-medium text-xs sm:w-auto sm:min-w-[130px]">
                            <SelectValue
                              placeholder={
                                timeRange === "ALL"
                                  ? t("全期間", "All time")
                                  : timeRange
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ALL">
                              {t("全期間", "All time")}
                            </SelectItem>
                            <SelectItem value="TODAY">
                              {t("本日", "Today")}
                            </SelectItem>
                            <SelectItem value="YESTERDAY">
                              {t("昨日", "Yesterday")}
                            </SelectItem>
                            <SelectItem value="WEEK">
                              {t("週間", "Week")}
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        {/* ユーザー毎に1作品フィルター */}
                        <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1.5">
                          <Checkbox
                            id={checkboxId}
                            checked={isOneWorkPerUser}
                            onCheckedChange={(checked) => {
                              const newValue = checked === true
                              setIsOneWorkPerUser(newValue)
                              const newSearchParams = new URLSearchParams(
                                searchParams,
                              )
                              if (newValue) {
                                newSearchParams.set("isOneWorkPerUser", "true")
                              } else {
                                newSearchParams.delete("isOneWorkPerUser")
                              }
                              updateQueryParams(newSearchParams)
                            }}
                          />
                          <label
                            htmlFor={checkboxId}
                            className="cursor-pointer font-medium text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t("ユーザー毎に1作品", "One work per user")}
                          </label>
                        </div>
                      </div>

                      {/* 右側: 表示方式切り替え */}
                      <div className="flex flex-wrap gap-2 md:ml-auto">
                        <div className="flex rounded-md bg-muted/50 p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setInternalIsPagination(false)
                              const p = new URLSearchParams(searchParams)
                              p.set("isPagination", "false")
                              updateQueryParams(p)
                            }}
                            className={`flex items-center space-x-1.5 rounded-md px-2 py-1 font-medium text-xs transition-all ${
                              !internalIsPagination
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            } `}
                          >
                            <List className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              {t("フィード", "Feed")}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setInternalIsPagination(true)
                              const p = new URLSearchParams(searchParams)
                              p.set("isPagination", "true")
                              updateQueryParams(p)
                            }}
                            className={`flex items-center space-x-1.5 rounded-md px-2 py-1 font-medium text-xs transition-all ${
                              internalIsPagination
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            } `}
                          >
                            <Navigation className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">
                              {t("ページ", "Pages")}
                            </span>
                          </Button>
                        </div>
                        <div className="flex rounded-md bg-muted/50 p-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChangeDialogMode(false)}
                            className={`flex items-center space-x-1.5 rounded-md px-2 py-1 font-medium text-xs transition-all ${
                              !isDialogMode
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            } `}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">
                              {t("リンク遷移", "Open page")}
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChangeDialogMode(true)}
                            className={`flex items-center space-x-1.5 rounded-md px-2 py-1 font-medium text-xs transition-all ${
                              isDialogMode
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            } `}
                          >
                            <PlaySquare className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">
                              {t("ダイアログ", "Dialog")}
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 新着作品 */}
              <Suspense
                fallback={
                  <HomeNewWorksSkeleton
                    view="new"
                    isPagination={internalIsPagination}
                  />
                }
              >
                {internalIsPagination ? (
                  <HomePaginationWorksSection
                    initialWorks={data.initialNewWorks}
                    page={newWorksPage}
                    setPage={setNewWorksPage}
                    workType={workType}
                    isPromptPublic={isPromptPublic}
                    sortType={sortType}
                    timeRange={timeRange}
                    isOneWorkPerUser={isOneWorkPerUser}
                    onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                    updateWorks={updateCurrentWorks}
                  />
                ) : (
                  <HomeWorksSection
                    page={newWorksPage}
                    setPage={setNewWorksPage}
                    workType={workType}
                    isPromptPublic={isPromptPublic}
                    sortType={sortType}
                    timeRange={timeRange}
                    isOneWorkPerUser={isOneWorkPerUser}
                    isPagination={false}
                    onPaginationModeChange={setInternalIsPagination}
                    onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                    updateWorks={updateCurrentWorks}
                  />
                )}
              </Suspense>
            </div>
          )}

          {workView === "popular" && (
            <div className="space-y-4">
              {/* 表示方式切り替え */}
              <div className="flex justify-end">
                <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogMode(false)}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                      !isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    } `}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("リンク遷移", "Open page")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogMode(true)}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                      isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    } `}
                  >
                    <PlaySquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("ダイアログ", "Dialog")}
                    </span>
                  </Button>
                </div>
              </div>

              <Suspense
                fallback={
                  <HomeNewWorksSkeleton
                    view="popular"
                    isPagination={internalIsPagination}
                  />
                }
              >
                <HomeHotWorksSection
                  page={newWorksPage}
                  setPage={setNewWorksPage}
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                  isPagination={internalIsPagination}
                  onPaginationModeChange={setInternalIsPagination}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                  updateWorks={updateCurrentWorks}
                />
              </Suspense>
            </div>
          )}

          {workView === "new-user" && (
            <div className="space-y-4">
              {/* 表示方式切り替え */}
              <div className="flex flex-wrap justify-end gap-2">
                <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInternalIsPagination(false)
                      const p = new URLSearchParams(searchParams)
                      p.set("isPagination", "false")
                      updateQueryParams(p)
                    }}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                      !internalIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <List className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("フィード", "Feed")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInternalIsPagination(true)
                      const p = new URLSearchParams(searchParams)
                      p.set("isPagination", "true")
                      updateQueryParams(p)
                    }}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                      internalIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("ページ", "Pages")}
                    </span>
                  </Button>
                </div>
                <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChangeDialogMode(false)}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                      !isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    } `}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("リンク遷移", "Open page")}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChangeDialogMode(true)}
                    className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                      isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    } `}
                  >
                    <PlaySquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {t("ダイアログ", "Dialog")}
                    </span>
                  </Button>
                </div>
              </div>

              <Suspense
                fallback={
                  <HomeNewWorksSkeleton
                    view="new-user"
                    isPagination={internalIsPagination}
                  />
                }
              >
                <HomeNewUsersWorkListSection
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                  isOneWorkPerUser={isOneWorkPerUser}
                  onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
                  updateWorks={updateCurrentWorks}
                />
              </Suspense>
            </div>
          )}
        </TabsContent>
        {/* ---------------------- タブ: フォロー中のユーザ ---------------------- */}
        <TabsContent value="follow-user" className="space-y-4">
          {/* Feed / Pages 切り替えボタン */}
          <div className="flex flex-wrap justify-end gap-2">
            <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalIsPagination(false)
                  const p = new URLSearchParams(searchParams)
                  p.set("isPagination", "false")
                  updateQueryParams(p)
                }}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  !internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("フィード", "Feed")}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalIsPagination(true)
                  const p = new URLSearchParams(searchParams)
                  p.set("isPagination", "true")
                  updateQueryParams(p)
                }}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("ページ", "Pages")}</span>
              </Button>
            </div>
            <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogMode(false)}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  !isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } `}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("リンク遷移", "Open page")}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogMode(true)}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } `}
              >
                <PlaySquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("ダイアログ", "Dialog")}
                </span>
              </Button>
            </div>
          </div>

          {/* コンテンツ */}
          <Suspense
            fallback={
              <HomeNewWorksSkeleton
                view="new"
                isPagination={internalIsPagination}
              />
            }
          >
            <FollowUserFeedContents
              tab={currentTab}
              key={`follow-user-${followUserFeedPage}-${currentTab}`}
              page={followUserFeedPage}
              setPage={setFollowUserFeedPage}
              isPagination={internalIsPagination}
              onPaginationModeChange={setInternalIsPagination}
              onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              updateWorks={updateCurrentWorks}
            />
          </Suspense>
        </TabsContent>
        {/* ---------------------- タブ: お気に入りタグ ---------------------- */}
        <TabsContent value="follow-tag" className="space-y-4">
          {/* Feed / Pages 切り替えボタン */}
          <div className="flex flex-wrap justify-end gap-2">
            <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalIsPagination(false)
                  const p = new URLSearchParams(searchParams)
                  p.set("isPagination", "false")
                  updateQueryParams(p)
                }}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  !internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("フィード", "Feed")}
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalIsPagination(true)
                  const p = new URLSearchParams(searchParams)
                  p.set("isPagination", "true")
                  updateQueryParams(p)
                }}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Navigation className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t("ページ", "Pages")}</span>
              </Button>
            </div>
            <div className="flex rounded-lg bg-muted/50 p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChangeDialogMode(false)}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  !isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } `}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("リンク遷移", "Open page")}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChangeDialogMode(true)}
                className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
                  isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } `}
              >
                <PlaySquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {t("ダイアログ", "Dialog")}
                </span>
              </Button>
            </div>
          </div>

          <Suspense
            fallback={
              <HomeNewWorksSkeleton
                view="new"
                isPagination={internalIsPagination}
              />
            }
          >
            <FollowTagsFeedContents
              _tab={currentTab}
              key={`follow-tag-${followTagFeedPage}-${currentTab}`}
              page={followTagFeedPage}
              setPage={setFollowTagFeedPage}
              isPagination={internalIsPagination}
              onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              updateWorks={updateCurrentWorks}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* ────────── 作品ダイアログ ────────── */}
      {workDialog.isOpen && workDialog.workId && (
        <WorkViewerDialog
          works={displayedWorks}
          startWorkId={workDialog.workId}
          onClose={workDialog.closeDialog}
          loadMore={!internalIsPagination ? loadMore : undefined}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoadingMore}
        />
      )}
    </>
  )
}

export default function Index() {
  return <HomeIndexPage forcedTab="new" />
}

export const headers: HeadersFunction = ({ loaderHeaders }) => ({
  "Cache-Control":
    loaderHeaders.get("Cache-Control") ??
    "no-store, no-cache, must-revalidate, max-age=0",
})

const initialNewWorksQuery = graphql(
  `query InitialNewWorks($offset:Int!,$limit:Int!,$where:WorksWhereInput!) {
     works(offset:$offset,limit:$limit,where:$where){
       ...HomeWork
       ...HomeNovelsWorkListItem
       ...HomeVideosWorkListItem
     }
   }`,
  [
    HomeWorkFragment,
    HomeNovelsWorkListItemFragment,
    HomeVideosWorkListItemFragment,
  ],
)

const query = graphql(
  `query HomeQuery(
    $year: Int!
    $month: Int!
    $day: Int!
  ) {
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
    }
    hotTags {
      ...HomeTagListItem
    }
    recommendedTags: recommendedTags(
      limit: 16
      where: {
        isSensitive: false,
      }
    ) {
      ...HomeTag
    }
    appEvents(limit: 12, offset: 0) {
      id
      slug
      title
      thumbnailImageUrl
      status
      startAt
      endAt
      tag
      worksCount
    }
    userEvents(limit: 12, offset: 0) {
      id
      slug
      title
      thumbnailImageUrl
      headerImageUrl
      status
      startAt
      endAt
      mainTag
      tags
      rankingEnabled
      entryCount
      participantCount
      userId
      userIconUrl
      userName
    }
  }`,
  [
    HomeTagListItemFragment,
    HomeTagFragment,
  ],
)

const homeSidebarQuery = graphql(
  `query HomeSidebarQuery(
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
    $awardWorksLimit: Int!
  ) {
    workAwards(
      offset: 0
      limit: $awardWorksLimit
      where: {
        year: $awardYear
        month: $awardMonth
        day: $awardDay
        isSensitive: false
      }
    ) {
      ...HomeAwardWorks
    }
    newPostedUsers: newPostedUsers(
      offset: 0
      limit: 8
    ) {
      ...HomeNewPostedUsers
    }
    newComments: newComments(
      offset: 0
      limit: 8
      where: {
        isSensitive: false
        isTextOnly: true
        ratings: [G, R15]
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [
    HomeAwardWorksFragment,
    HomeNewPostedUsersFragment,
    HomeNewCommentsFragment,
  ],
)

const viewerCurrentPassQuery = graphql(`
  query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }
`)

export const SideMenuAdvertisementsFragment = graphql(`
  fragment SideMenuAdvertisementsFields on CustomerAdvertisementNode @_unmask {
    id
    imageUrl
    url
    displayProbability
    clickCount
    impressionCount
    isSensitive
    createdAt
    page
    startAt
    endAt
    isActive
  }
`)

const randomCustomerAdvertisementQuery = graphql(
  `query RandomCustomerAdvertisement($where: RandomCustomerAdvertisementWhereInput!) {
    randomCustomerAdvertisement(where: $where) {
      ...SideMenuAdvertisementsFields
    }
  }`,
  [SideMenuAdvertisementsFragment],
)

const updateClickedCountCustomerAdvertisementMutation = graphql(`
  mutation UpdateClickedCountCustomerAdvertisement($id: ID!) {
    updateClickedCountCustomerAdvertisement(id: $id) {
      id
    }
  }
`)
