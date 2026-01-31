import { loaderClient } from "~/lib/loader-client"
import {
  HomeAwardWorkSection,
  HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeBanners,
  HomeBannerWorkFragment,
  HomeOngoingEventFragment,
} from "~/routes/($lang)._main._index/components/home-banners"
import {
  HomeTagList,
  HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeTagFragment,
  HomeTagsSection,
} from "~/routes/($lang)._main._index/components/home-tags-section"
import {
  HomePromotionWorkFragment,
  HomeWorksUsersRecommendedSection,
} from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeWorksGeneratedSection } from "~/routes/($lang)._main._index/components/home-works-generated-section"

import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import {
  HomeTagWorkFragment,
  HomeWorksTagSection,
} from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { getJstDate } from "~/utils/jst-date"
import { createMeta } from "~/utils/create-meta"
import {
  HomeNewUsersWorksFragment,
  HomeNewUsersWorksSection,
} from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { createClient as createCmsClient } from "microcms-js-sdk"
import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"
import {
  HomeNewPostedUsersFragment,
  HomeNewUsersSection,
} from "~/routes/($lang)._main._index/components/home-new-users-section"
import {
  HomeNewCommentsFragment,
  HomeNewCommentsSection,
} from "~/routes/($lang)._main._index/components/home-new-comments"
import { useState, useEffect, Suspense, useMemo, useId } from "react"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import {
  ArrowDownWideNarrow,
  ExternalLink,
  List,
  Navigation,
  PlaySquare,
} from "lucide-react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent } from "~/components/ui/tabs"
import { Checkbox } from "~/components/ui/checkbox"
import { FollowTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-tags-feed-contents"
import { FollowUserFeedContents } from "~/routes/($lang)._main._index/components/follow-user-feed-contents"
import { HomeHotWorksSection } from "~/routes/($lang)._main._index/components/home-hot-works-section"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { Button } from "~/components/ui/button"
import { useLocale } from "~/hooks/use-locale"
import { useUpdateQueryParams } from "~/hooks/use-update-query-params"
import { useMutation, useQuery } from "@apollo/client/index"
import { HomeAwardWorksSection } from "~/routes/($lang)._main._index/components/home-award-works"
import { HomeReleaseList } from "~/routes/($lang)._main._index/components/home-release-list"
import { HomeNewUsersWorkListSection } from "~/routes/($lang)._main._index/components/home-new-user-work-list-section"
import { HomePaginationWorksSection } from "~/routes/($lang)._main._index/components/home-pagination-works-section"
import { WorkViewerDialog } from "~/components/work/work-viewer-dialog"
import type { FragmentOf } from "gql.tada"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME, undefined, props.params.lang)
}

const getUtcDateString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2)
  const day = `0${date.getUTCDate()}`.slice(-2)

  return `${year}/${month}/${day}`
}

export async function loader(_props: LoaderFunctionArgs) {
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

  const microCmsClient = createCmsClient({
    serviceDomain: "aipictors",
    apiKey: config.cms.microCms.apiKey,
  })

  const releaseList: MicroCmsApiReleaseResponse = await microCmsClient.get({
    endpoint: `releases?orders=-createdAt&limit=${4}&offset=0`,
  })

  const result = await loaderClient.query({
    query: query,
    variables: {
      awardDay: yesterday.getDate(),
      awardMonth: yesterday.getMonth() + 1,
      awardYear: yesterday.getFullYear(),
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      adWorksLimit: config.query.homeWorkCount.ad,
      promotionWorksLimit: config.query.homeWorkCount.promotion,
      awardWorksLimit: config.query.homeWorkCount.award,
      categoryFirst: randomCategories[0],
      categorySecond: randomCategories[1],
      tagWorksLimit: config.query.homeWorkCount.tag,
      newUsersWorksLimit: config.query.homeWorkCount.newUser,
    },
  })

  const awardDateText = getUtcDateString(yesterday)

  return {
    ...result.data,
    awardDateText: awardDateText,
    firstTag: randomCategories[0],
    secondTag: randomCategories[1],
    releaseList,
  }
}

// カスタムフック: スクロール位置の保存・復元（windowオブジェクトを使用しない）
function useScrollRestoration(isMounted: boolean) {
  useEffect(() => {
    if (isMounted) {
      // スクロール位置の復元を行わない（React Routerが自動的に保持する場合）
    }
  }, [isMounted])
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()
  const checkboxId = useId()

  const [searchParams, _setSearchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()

  // URLパラメータから初期値を取得する関数（SSR対応）
  const getInitialTabValue = () => {
    if (typeof window === "undefined") return "home"
    const tabParam = searchParams.get("tab")
    return tabParam || "home"
  }

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

  // タブ関連 - URLパラメータから初期化
  const initialTab = getInitialTabValue()
  const initialPage = getInitialPageValue()
  const [newWorksPage, setNewWorksPage] = useState(
    initialTab === "new" ? initialPage : 0,
  )
  const [followUserFeedPage, setFollowUserFeedPage] = useState(
    initialTab === "follow-user" ? initialPage : 0,
  )
  const [followTagFeedPage, setFollowTagFeedPage] = useState(
    initialTab === "follow-tag" ? initialPage : 0,
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

  // タブ（home / new / follow-user / follow-tag）
  const [currentTab, setCurrentTab] = useState(initialTab)

  // 新着タブ内（「新着 / 人気 / 新規ユーザ」）切り替え
  const [workView, setWorkView] = useState(getInitialWorkView())

  const [internalIsPagination, setInternalIsPagination] = useState(
    getInitialIsPagination(),
  )

  // 作品遷移モード（ダイアログ / 直接リンク）
  const [isDialogMode, setIsDialogMode] = useState(false)

  // Work dialog URL state management
  const workDialog = useWorkDialogUrl()

  // 作品データの管理用state
  const [currentWorks, setCurrentWorks] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[]
  >([])

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
    () =>
      [
        ...(data?.adWorks ?? []),
        ...(data?.promotionWorks ?? []),
        ...(data?.newUserWorks ?? []),
        ...(data?.workAwards ?? []),
        ...(data?.firstTagWorks ?? []),
        ...(data?.secondTagWorks ?? []),
      ] as FragmentOf<typeof PhotoAlbumWorkFragment>[],
    [data],
  )

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
    setCurrentTab(tab)
    setNewWorksPage(0)
    setFollowUserFeedPage(0)
    setFollowTagFeedPage(0)

    // 既存パラメータをコピーして編集
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set("tab", tab)

    // 別タブでは page 不要なので消す or 0 にする
    if (tab === "new") {
      newSearchParams.set("page", "0")
    } else if (tab === "follow-user") {
      newSearchParams.set("page", "0")
    } else if (tab === "follow-tag") {
      newSearchParams.set("page", "0")
    } else {
      newSearchParams.delete("page")
    }

    updateQueryParams(newSearchParams)
  }

  /**
   * タブ or ページ番号の変更時にクエリパラメータを更新
   */
  useEffect(() => {
    if (!isMounted) return
    const newSearchParams = new URLSearchParams(searchParams)

    // タブ
    newSearchParams.set("tab", currentTab)

    // ページ
    if (currentTab === "new") {
      newSearchParams.set("page", newWorksPage.toString())
    } else if (currentTab === "follow-user") {
      newSearchParams.set("page", followUserFeedPage.toString())
    } else if (currentTab === "follow-tag") {
      newSearchParams.set("page", followTagFeedPage.toString())
    } else {
      newSearchParams.delete("page")
    }

    // 期間指定
    if (currentTab === "new") {
      newSearchParams.set("timeRange", timeRange)
    }

    // ユーザー毎に1作品フィルター
    if (currentTab === "new") {
      if (isOneWorkPerUser) {
        newSearchParams.set("isOneWorkPerUser", "true")
      } else {
        newSearchParams.delete("isOneWorkPerUser")
      }
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
    newSearchParams.set("view", view)
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
    newSearchParams.set("page", "0")
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

  const { data: pass } = useQuery(viewerCurrentPassQuery, {})
  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
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

  // スクロール位置復元しない
  useScrollRestoration(isMounted)

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

  // ホームタブでの作品インデックス計算
  const _getHomeWorkIndex = (sectionIndex: number, workIndex: number) => {
    let totalIndex = 0

    // バナー作品のインデックス
    if (sectionIndex === 0) {
      return workIndex
    }
    totalIndex += data.adWorks?.length || 0

    // プロモーション作品のインデックス
    if (sectionIndex === 1) {
      return totalIndex + workIndex
    }
    totalIndex += data.promotionWorks?.length || 0

    // 新規ユーザ作品のインデックス
    if (sectionIndex === 2) {
      return totalIndex + workIndex
    }
    totalIndex += data.newUserWorks?.length || 0

    // 受賞作品のインデックス
    if (sectionIndex === 3) {
      return totalIndex + workIndex
    }
    totalIndex += data.workAwards?.length || 0

    // 第1タグ作品のインデックス
    if (sectionIndex === 4) {
      return totalIndex + workIndex
    }
    totalIndex += data.firstTagWorks?.length || 0

    // 第2タグ作品のインデックス
    if (sectionIndex === 5) {
      return totalIndex + workIndex
    }

    return totalIndex + workIndex
  }

  if (data === null) {
    return null
  }

  return (
    <>
      <Tabs
        value={currentTab}
        defaultValue="home"
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        {/* ヘッダー部分: タブ */}
        <div className="-mx-4 border-b bg-background/98 px-4 py-2">
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
            {data.adWorks && data.adWorks.length > 0 && (
              <HomeBanners
                works={data.adWorks}
                ongoingEvents={data.latestEvent ? [data.latestEvent] : []}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              />
            )}
          </Suspense>
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            <div className="flex w-full min-w-0 flex-col space-y-4 overflow-hidden md:max-w-[calc(100%_-_262px)]">
              <HomeReleaseList releaseList={data.releaseList} />
              <HomeWorksUsersRecommendedSection
                works={data.promotionWorks}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              />
              <HomeWorksGeneratedSection
                works={[]}
                dateText={data.awardDateText}
              />
              <HomeNewUsersWorksSection
                works={data.newUserWorks}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              />
              <HomeAwardWorkSection
                awardDateText={data.awardDateText}
                title={t("前日ランキング", "Previous Day Ranking")}
                awards={data.workAwards}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              />
              <HomeWorksTagSection
                tag={data.firstTag}
                works={data.firstTagWorks}
                secondTag={data.secondTag}
                secondWorks={data.secondTagWorks}
                isCropped={true}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
              />
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
                    />
                  </Link>
                )}
                {data.newPostedUsers && (
                  <HomeNewUsersSection users={data.newPostedUsers} />
                )}
                {data.newComments && data.newComments.length > 0 && (
                  <HomeNewCommentsSection comments={data.newComments} />
                )}
                {data.workAwards && (
                  <HomeAwardWorksSection works={data.workAwards} />
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
              <div className="space-y-3 rounded-lg bg-muted/30 p-4">
                {/* フィルター行1: 種類、プロンプト、ソート */}
                <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-3">
                  {/* 種類 */}
                  <Select
                    value={workType ? workType : ""}
                    onValueChange={handleWorkTypeChange}
                  >
                    <SelectTrigger className="h-10 min-w-0 font-medium text-xs md:min-w-[130px] md:text-sm">
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
                      <SelectItem value="ALL">{t("種類", "Type")}</SelectItem>
                      <SelectItem value="WORK">{t("画像", "Image")}</SelectItem>
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
                    <SelectTrigger className="h-10 min-w-0 font-medium text-xs md:min-w-[130px] md:text-sm">
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
                      <SelectItem value="prompt">{t("あり", "Yes")}</SelectItem>
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
                    <SelectTrigger className="h-10 min-w-0 font-medium text-xs md:min-w-[130px] md:text-sm">
                      <ArrowDownWideNarrow className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <SelectValue
                        placeholder={sortType ? sortType : t("最新", "Latest")}
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
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  {/* 左側: 期間指定とチェックボックス */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    {/* 期間指定 */}
                    <Select
                      value={timeRange}
                      onValueChange={handleTimeRangeChange}
                    >
                      <SelectTrigger className="h-10 w-full font-medium text-xs sm:w-auto sm:min-w-[130px] md:text-sm">
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
                    <div className="flex items-center space-x-2 rounded-lg border bg-background px-3 py-2.5 shadow-sm transition-colors hover:bg-muted/50">
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
                        className="cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {t("ユーザー毎に1作品", "One work per user")}
                      </label>
                    </div>
                  </div>

                  {/* 右側: 表示方式切り替え */}
                  <div className="flex flex-wrap gap-2 md:ml-auto">
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
                        className={`flex items-center space-x-1.5 rounded-md px-3 py-2 font-medium text-xs transition-all ${
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
                        <span className="hidden lg:inline">
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
                        <span className="hidden lg:inline">
                          {t("ダイアログ", "Dialog")}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 新着作品 */}
              <Suspense fallback={<AppLoadingPage />}>
                {internalIsPagination ? (
                  <HomePaginationWorksSection
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

              <Suspense fallback={<AppLoadingPage />}>
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

              <Suspense fallback={<AppLoadingPage />}>
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
          <Suspense fallback={<AppLoadingPage />}>
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

          <Suspense fallback={<AppLoadingPage />}>
            <FollowTagsFeedContents
              tab={currentTab}
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

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

const query = graphql(
  `query HomeQuery(
    $year: Int!
    $month: Int!
    $day: Int!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
    $adWorksLimit: Int!
    $promotionWorksLimit: Int!
    $awardWorksLimit: Int!
    $categoryFirst: String!
    $categorySecond: String!
    $tagWorksLimit: Int!
    $newUsersWorksLimit: Int!
  ) {
    adWorks: works(
      offset: 0,
      limit: $adWorksLimit,
      where: {
        isFeatured: true,
        isNowCreatedAt: true,
        ratings: [G],
      }
    ) {
      ...HomeBannerWork
    }
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
    }
    hotTags {
      ...HomeTagListItem
    }
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
      ...HomeWorkAward
    }
    recommendedTags: recommendedTags(
      limit: 16
      where: {
        isSensitive: false,
      }
    ) {
      ...HomeTag
    }
    firstTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [G],
        search: $categoryFirst,
        isNowCreatedAt: true,
        orderBy: LIKES_COUNT
      }
    ) {
      ...HomeTagWork
    }
    secondTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [G],
        search: $categorySecond,
        isNowCreatedAt: true,
        orderBy: LIKES_COUNT
      }
    ) {
      ...HomeTagWork
    }
    promotionWorks: works(
      offset: 0,
      limit: $promotionWorksLimit,
      where: {
        isRecommended: true
        isNowCreatedAt: true
        ratings: [G, R15]
      }
    ) {
      ...HomePromotionWork
    }
    newUserWorks: newUserWorks(
      offset: 0,
      limit: $newUsersWorksLimit,
      where: {
        ratings: [G, R15],
        isNowCreatedAt: true
      }
    ) {
      ...HomeNewUsersWorks
    }
    newPostedUsers: newPostedUsers(
      offset: 0,
      limit: 8,
    ) {
      ...HomeNewPostedUsers
    }
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: false,
        isTextOnly: true,
        ratings: [G, R15]
      }
    ) {
      ...HomeNewComments
    }
    latestEvent: appEvents(
      offset: 0,
      limit: 1
    ) {
      ...HomeOngoingEvent
    }
  }`,
  [
    HomeBannerWorkFragment,
    HomeOngoingEventFragment,
    HomePromotionWorkFragment,
    HomeTagListItemFragment,
    HomeWorkAwardFragment,
    HomeTagFragment,
    HomeTagWorkFragment,
    HomeNewUsersWorksFragment,
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
