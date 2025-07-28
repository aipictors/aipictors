import { loaderClient } from "~/lib/loader-client"
import {
  HomeAwardWorkSection,
  HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeBanners,
  HomeBannerWorkFragment,
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
import { SensitiveToggle } from "~/components/sensitive/sensitive-toggle"
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
import { useState, useEffect, Suspense, useMemo } from "react"
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

  const [searchParams, _setSearchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()

  const [isMounted, setIsMounted] = useState(false)

  // タブ関連
  const [newWorksPage, setNewWorksPage] = useState(0)
  const [followUserFeedPage, setFollowUserFeedPage] = useState(0)
  const [followTagFeedPage, setFollowTagFeedPage] = useState(0)

  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(null)
  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(null)
  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(null)

  const navigate = useNavigate()

  // 期間指定の state を追加し、URL パラメータから初期値を読む
  const [timeRange, setTimeRange] = useState<string>(
    searchParams.get("timeRange") || "ALL",
  )

  const location = useLocale()

  // タブ（home / new / follow-user / follow-tag）
  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") || "home",
  )

  // 新着タブ内（「新着 / 人気 / 新規ユーザ」）切り替え
  const [workView, setWorkView] = useState(searchParams.get("view") || "new")

  const [internalIsPagination, setInternalIsPagination] = useState(true)

  // 作品遷移モード（ダイアログ / 直接リンク）
  const [isDialogMode, setIsDialogMode] = useState(false)

  // ダイアログ制御
  const [dialogIndex, setDialogIndex] = useState<string | null>(null)

  // 作品データの管理用state
  const [currentWorks, setCurrentWorks] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[]
  >([])

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
   * マウント時に、すでに URL に入っているクエリパラメータを用いて
   * 各 state を初期化する
   */
  useEffect(() => {
    // 初回のみ実行
    if (!isMounted) {
      // ページ番号
      const page = searchParams.get("page")
      const pageNumber = page ? Number.parseInt(page, 10) : 0

      if (!Number.isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= 100) {
        if (currentTab === "new") {
          setNewWorksPage(pageNumber)
        } else if (currentTab === "follow-user") {
          setFollowUserFeedPage(pageNumber)
        } else if (currentTab === "follow-tag") {
          setFollowTagFeedPage(pageNumber)
        }
      }

      // workType
      const wtParam = searchParams.get("workType")
      if (wtParam && wtParam !== "ALL") {
        setWorkType(wtParam as IntrospectionEnum<"WorkType">)
      }

      // isPromptPublic
      const isPromptParam = searchParams.get("isPromptPublic")
      if (isPromptParam === "true") {
        setIsPromptPublic(true)
      } else if (isPromptParam === "false") {
        setIsPromptPublic(false)
      }

      // sortType
      const sortTypeParam = searchParams.get("sortType")
      if (
        sortTypeParam === "DATE_CREATED" ||
        sortTypeParam === "LIKES_COUNT" ||
        sortTypeParam === "COMMENTS_COUNT"
      ) {
        setSortType(sortTypeParam as IntrospectionEnum<"WorkOrderBy">)
      }

      // timeRange
      const tr = searchParams.get("timeRange")
      if (tr && tr !== "ALL") {
        setTimeRange(tr)
      }

      // workView
      const viewParam = searchParams.get("view")
      if (viewParam) {
        setWorkView(viewParam)
      }

      setIsMounted(true)
    }
  }, [isMounted, searchParams, currentTab])

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

    updateQueryParams(newSearchParams)
  }, [
    currentTab,
    newWorksPage,
    followUserFeedPage,
    followTagFeedPage,
    isMounted,
    timeRange,
    updateQueryParams,
    searchParams,
    internalIsPagination,
  ])

  useEffect(() => {
    const urlTab = searchParams.get("tab") || "home"
    if (urlTab !== currentTab) {
      setCurrentTab(urlTab)
    }
  }, [searchParams])

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
    // displayedWorksのworkのid一致するもの
    const work = displayedWorks.find((w) => w.id === idx)
    if (!work) {
      console.error("Work not found for ID:", idx)
      return
    }
    if (isDialogMode) {
      console.log("Setting dialogIndex to:", idx)
      setDialogIndex(idx)
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
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        {/* ヘッダー部分: タブとR18ボタン */}
        <div className="-mx-1 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
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
                onChange={setCurrentTab}
              />
            </div>
            <div className="flex items-center gap-3">
              {/\/r($|\/)/.test(location.pathname) && (
                <div className="hidden items-center gap-2 rounded-lg bg-gradient-to-r from-red-100 to-pink-100 px-3 py-1.5 sm:flex dark:from-red-900/50 dark:to-pink-900/50">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  <span className="font-semibold text-red-700 text-sm dark:text-red-300">
                    {t("R18モード", "R18 Mode")}
                  </span>
                </div>
              )}
              <SensitiveToggle variant="compact" showStatus />
            </div>
          </div>
        </div>
        {/* ---------------------- タブ: ホーム ---------------------- */}
        <TabsContent value="home" className="m-0 flex flex-col space-y-4">
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
              onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
            />
          )}
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            <div className="flex w-full flex-col space-y-4">
              <HomeReleaseList releaseList={data.releaseList} />
              {/* {data.dailyTheme && (
                <div>
                  <HomeTagList
                    themeTitle={data.dailyTheme.title}
                    hotTags={data.hotTags}
                  />
                </div>
              )} */}
              <HomeWorksUsersRecommendedSection
                works={data.promotionWorks}
                onSelect={isDialogMode ? (idx) => openWork(idx) : undefined}
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
          <div className="flex space-x-2 md:space-x-4">
            <Button
              variant={workView === "new" ? "default" : "secondary"}
              onClick={() => handleWorkViewChange("new")}
              size="sm"
            >
              {t("新着", "New")}
            </Button>
            <Button
              variant={workView === "popular" ? "default" : "secondary"}
              onClick={() => handleWorkViewChange("popular")}
              size="sm"
            >
              <div className="flex space-x-1 md:space-x-2">
                <p>{t("人気", "Popular")}</p>
                <CrossPlatformTooltip
                  text={t(
                    "最近投稿された人気作品が表示されます",
                    "Recently popular works",
                  )}
                />
              </div>
            </Button>
            <Button
              variant={workView === "new-user" ? "default" : "secondary"}
              onClick={() => handleWorkViewChange("new-user")}
              size="sm"
            >
              <div className="flex space-x-1 md:space-x-2">
                <p className="hidden sm:block">
                  {t("新規ユーザ", "New Users")}
                </p>
                <p className="block sm:hidden">{t("新規", "New")}</p>
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
              <div className="space-y-3">
                {/* フィルター行1: 種類、プロンプト、ソート */}
                <div className="grid grid-cols-3 gap-2 md:flex md:space-x-4">
                  {/* 種類 */}
                  <Select
                    value={workType ? workType : ""}
                    onValueChange={handleWorkTypeChange}
                  >
                    <SelectTrigger className="min-w-0 text-xs md:min-w-[120px] md:text-sm">
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
                    <SelectTrigger className="min-w-0 text-xs md:min-w-[120px] md:text-sm">
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
                    <SelectTrigger className="min-w-0 text-xs md:min-w-[120px] md:text-sm">
                      <ArrowDownWideNarrow className="h-3 w-3 md:h-4 md:w-4" />
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

                {/* フィルター行2: 期間指定 + 表示方式切り替え */}
                <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                  {/* 期間指定 */}
                  <Select
                    value={timeRange}
                    onValueChange={handleTimeRangeChange}
                  >
                    <SelectTrigger className="w-full text-xs md:w-auto md:min-w-[120px] md:text-sm">
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
                      <SelectItem value="WEEK">{t("週間", "Week")}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* 表示方式切り替え - よりスタイリッシュなデザイン */}
                  <div className="flex space-x-2 md:space-x-4">
                    <div className="flex rounded-lg bg-muted p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setInternalIsPagination(false)
                          const p = new URLSearchParams(searchParams)
                          p.set("isPagination", "false")
                          updateQueryParams(p)
                        }}
                        className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                          !internalIsPagination
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        } `}
                      >
                        <List className="h-3 w-3" />
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
                        className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                          internalIsPagination
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        } `}
                      >
                        <Navigation className="h-3 w-3" />
                        <span className="hidden sm:inline">
                          {t("ページ", "Pages")}
                        </span>
                      </Button>
                    </div>
                    <div className="flex rounded-lg bg-muted p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDialogMode(false)}
                        className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                          !isDialogMode
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        } `}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>{t("リンク遷移", "Open page")}</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDialogMode(true)}
                        className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                          isDialogMode
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        } `}
                      >
                        <PlaySquare className="h-4 w-4" />
                        <span>{t("ダイアログ", "Dialog")}</span>
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
                    onSelect={isDialogMode ? openWork : undefined}
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
                    isPagination={false}
                    onPaginationModeChange={setInternalIsPagination}
                    onSelect={isDialogMode ? openWork : undefined}
                    updateWorks={updateCurrentWorks}
                  />
                )}
              </Suspense>
            </div>
          )}

          {workView === "popular" && (
            <div className="space-y-4">
              {/* 表示方式切り替え */}
              <div className="flex justify-end space-x-2 md:space-x-4">
                <div className="flex rounded-lg bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogMode(false)}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      !isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    } `}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{t("リンク遷移", "Open page")}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogMode(true)}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    } `}
                  >
                    <PlaySquare className="h-4 w-4" />
                    <span>{t("ダイアログ", "Dialog")}</span>
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
                  onSelect={isDialogMode ? openWork : undefined}
                  updateWorks={updateCurrentWorks}
                />
              </Suspense>
            </div>
          )}

          {workView === "new-user" && (
            <div className="space-y-4">
              {/* 表示方式切り替え */}
              <div className="flex justify-end space-x-2 md:space-x-4">
                <div className="flex rounded-lg bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInternalIsPagination(false)
                      const p = new URLSearchParams(searchParams)
                      p.set("isPagination", "false")
                      updateQueryParams(p)
                    }}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      !internalIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="h-3 w-3" />
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
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      internalIsPagination
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Navigation className="h-3 w-3" />
                    <span className="hidden sm:inline">
                      {t("ページ", "Pages")}
                    </span>
                  </Button>
                </div>
                <div className="flex rounded-lg bg-muted p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogMode(false)}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      !isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    } `}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>{t("リンク遷移", "Open page")}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogMode(true)}
                    className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                      isDialogMode
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    } `}
                  >
                    <PlaySquare className="h-4 w-4" />
                    <span>{t("ダイアログ", "Dialog")}</span>
                  </Button>
                </div>
              </div>

              <Suspense fallback={<AppLoadingPage />}>
                <HomeNewUsersWorkListSection
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                  onSelect={isDialogMode ? openWork : undefined}
                  updateWorks={updateCurrentWorks}
                />
              </Suspense>
            </div>
          )}
        </TabsContent>
        {/* ---------------------- タブ: フォロー中のユーザ ---------------------- */}
        <TabsContent value="follow-user" className="space-y-4">
          {/* Feed / Pages 切り替えボタン */}
          <div className="flex justify-end space-x-2 md:space-x-4">
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalIsPagination(false)
                  const p = new URLSearchParams(searchParams)
                  p.set("isPagination", "false")
                  updateQueryParams(p)
                }}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  !internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3 w-3" />
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
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Navigation className="h-3 w-3" />
                <span className="hidden sm:inline">{t("ページ", "Pages")}</span>
              </Button>
            </div>
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogMode(false)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                  !isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                } `}
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t("リンク遷移", "Open page")}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogMode(true)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                  isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                } `}
              >
                <PlaySquare className="h-4 w-4" />
                <span>{t("ダイアログ", "Dialog")}</span>
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
              onSelect={isDialogMode ? openWork : undefined}
              updateWorks={updateCurrentWorks}
            />
          </Suspense>
        </TabsContent>
        {/* ---------------------- タブ: お気に入りタグ ---------------------- */}
        <TabsContent value="follow-tag" className="space-y-4">
          {/* Feed / Pages 切り替えボタン */}
          <div className="flex justify-end space-x-2 md:space-x-4">
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setInternalIsPagination(false)
                  const p = new URLSearchParams(searchParams)
                  p.set("isPagination", "false")
                  updateQueryParams(p)
                }}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  !internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3 w-3" />
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
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 text-xs ${
                  internalIsPagination
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Navigation className="h-3 w-3" />
                <span className="hidden sm:inline">{t("ページ", "Pages")}</span>
              </Button>
            </div>
            <div className="flex rounded-lg bg-muted p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogMode(false)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                  !isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                } `}
              >
                <ExternalLink className="h-4 w-4" />
                <span>{t("リンク遷移", "Open page")}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDialogMode(true)}
                className={`flex items-center space-x-1 rounded-md px-3 py-1.5 font-medium text-xs transition-all ${
                  isDialogMode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                } `}
              >
                <PlaySquare className="h-4 w-4" />
                <span>{t("ダイアログ", "Dialog")}</span>
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
              onSelect={isDialogMode ? openWork : undefined}
              updateWorks={updateCurrentWorks}
            />
          </Suspense>
        </TabsContent>
      </Tabs>

      {/* ────────── 作品ダイアログ ────────── */}
      {dialogIndex !== null && (
        <WorkViewerDialog
          works={displayedWorks}
          startWorkId={dialogIndex}
          onClose={() => {
            setDialogIndex(null)
          }}
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
        ratings: [G, R15]
      }
    ) {
      ...HomeNewComments
    }
  }`,
  [
    HomeBannerWorkFragment,
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
