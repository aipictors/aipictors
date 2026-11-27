import { useMutation, useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useLocation, useSearchParams } from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import {
  type CSSProperties,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { Tabs, TabsContent } from "~/components/ui/tabs"
import { WorkViewerDialog } from "~/components/work/lazy-work-viewer-dialog"
import {
  HomePromotionWorksSection,
  PROMOTION_FILL_COUNT,
} from "~/components/work/work-promotion"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"
import { useNavigate } from "~/lib/app/locale-router"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { FollowSensitiveTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-tags-feed-contents"
import { FollowSensitiveUserFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-user-feed-contents"
import { HomeDailyThemeCard } from "~/routes/($lang)._main._index/components/home-daily-theme-card"
import { HomeDeferredSection } from "~/routes/($lang)._main._index/components/home-deferred-section"
import {
  HomeModelLinks,
  HomeNewCreators,
  HomeTopCreators,
} from "~/routes/($lang)._main._index/components/home-discovery-links"
import { HomeHotWorkFragment } from "~/routes/($lang)._main._index/components/home-hot-carousel"
import { HomeImportantReleaseBanner } from "~/routes/($lang)._main._index/components/home-important-release-banner"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import { HomeQuickLinks } from "~/routes/($lang)._main._index/components/home-quick-links"
import { HomeQuickPreviewBar } from "~/routes/($lang)._main._index/components/home-quick-preview-bar"
import { HomeRankingTabContent } from "~/routes/($lang)._main._index/components/home-ranking-tab-content"
import { HomeSensitiveWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-section"
import { HomeSensitiveWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-users-recommended-section"
import { HomeSidebar } from "~/routes/($lang)._main._index/components/home-sidebar"
import {
  randomCustomerAdvertisementQuery,
  updateClickedCountCustomerAdvertisementMutation,
  viewerCurrentPassQuery,
} from "~/routes/($lang)._main._index/components/home-sidebar-queries"
import {
  HOME_HOT_TAGS_COUNT,
  HomeTagList,
  HomeTagListItemFragment,
} from "~/routes/($lang)._main._index/components/home-tag-list"
import {
  HomeTagWorksPlaceholder,
  HomeTagWorksSection,
  HomeWorksShelf,
} from "~/routes/($lang)._main._index/components/home-tag-works-section"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomeViewModeToggles } from "~/routes/($lang)._main._index/components/home-view-mode-toggles"
import {
  HomePromotionWorkFragment,
  RECOMMENDED_PAD_COUNT,
} from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { RecommendedFeedContents } from "~/routes/($lang)._main._index/components/recommended-feed-contents"
import {
  type HomeTopCreator,
  loadHomeReleases,
} from "~/routes/($lang)._main._index/home-loader.server"
import { buildHomeEventPreviews } from "~/routes/($lang)._main._index/utils/home-event-previews"
import { HomeNewUsersSensitiveWorkListSection } from "~/routes/($lang).r._index/components/home-new-user-sensitive-work-list-section"
import {
  HomePaginationSensitiveWorksSection,
  SensitiveWorksQuery,
} from "~/routes/($lang).r._index/components/home-pagination-sensitive-works-section"
import { SensitiveContinueBanner } from "~/routes/($lang).r._index/components/sensitive-continue-banner"
import { SensitiveDisplaySettings } from "~/routes/($lang).r._index/components/sensitive-display-settings"
import { SensitiveHomeAbout } from "~/routes/($lang).r._index/components/sensitive-home-about"
import { SensitiveWorksFilterBar } from "~/routes/($lang).r._index/components/sensitive-works-filter-bar"
import {
  getHomeTagWorks,
  HomeTagRowWorkFragment,
  type HomeTagWorksResponse,
  type HomeTagWorksRow,
} from "~/routes/api.home-tag-works/route"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import { getJstDate } from "~/utils/jst-date"
import {
  isFeaturableSensitiveTag,
  isFeaturableSensitiveWork,
} from "~/utils/sensitive-tag-filter"

// ---------- meta ----------
export const meta: MetaFunction = (props) =>
  createSensitiveMeta(META.HOME_SENSITIVE, undefined, props.params.lang)

// ---------- loader ----------
/**
 * いま人気の R18 は、この日数の作品をいいね順に（hotWorks は isSensitive を付けても全年齢の作品を返すので使わない）
 */
const HOT_WORKS_DAYS = 2

const DAY_MS = 24 * 60 * 60 * 1000

/** 作品の一覧（いま人気・新着）の数。PC の 6 列で 4 段 */
const SHELF_WORKS_COUNT = 24

/** ランキング・人気のクリエイターの数 */
const RANKING_COUNT = 12

const toDateText = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

type ShelfSourceWork = HomeTagWorksRow["works"][number] & {
  rating?: string | null
  tagNames?: string[] | null
}

/** ガイドラインに触れそうなタグの作品と R18G を除いて、一覧に要る項目だけにする */
const toSensitiveShelfWorks = (
  works: (ShelfSourceWork | null | undefined)[] | null | undefined,
  limit: number,
): HomeTagWorksRow["works"] =>
  (works ?? [])
    .filter(
      (work): work is ShelfSourceWork =>
        work !== null &&
        work !== undefined &&
        work.rating === "R18" &&
        isFeaturableSensitiveWork({ tagNames: work.tagNames ?? [] }),
    )
    .slice(0, limit)
    .map((work) => ({
      id: work.id,
      title: work.title,
      enTitle: work.enTitle ?? null,
      likesCount: work.likesCount,
      smallThumbnailImageURL: work.smallThumbnailImageURL,
      smallThumbnailImageWidth: work.smallThumbnailImageWidth,
      smallThumbnailImageHeight: work.smallThumbnailImageHeight,
      user: work.user ? { id: work.user.id } : null,
    }))

/** 日付の切れ目にそろえた N 日前（同じ日のあいだは同じ問い合わせになるように） */
const toDaysAgoIso = (days: number) =>
  new Date(
    Math.floor(Date.now() / DAY_MS) * DAY_MS - days * DAY_MS,
  ).toISOString()

export async function loader(props: LoaderFunctionArgs) {
  const now = getJstDate()
  const url = new URL(props.request.url)

  // 新着タブで開いたときは、ファーストビューの作品もサーバーの HTML に入れる
  const isNewTab = url.searchParams.get("tab") === "new"

  const yesterday = new Date(now.getTime() - DAY_MS)
  const dayBeforeYesterday = new Date(now.getTime() - 2 * DAY_MS)

  const [{ data }, newWorksResp, releases, tagWorks] = await Promise.all([
    loaderClient.query({
      query,
      variables: {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        promotionWorksLimit: config.query.homeWorkCount.promotion,
        hotWorksAfter: toDaysAgoIso(HOT_WORKS_DAYS),
        awardYear: yesterday.getFullYear(),
        awardMonth: yesterday.getMonth() + 1,
        awardDay: yesterday.getDate(),
        olderAwardYear: dayBeforeYesterday.getFullYear(),
        olderAwardMonth: dayBeforeYesterday.getMonth() + 1,
        olderAwardDay: dayBeforeYesterday.getDate(),
        userRankingDate: toDateText(yesterday),
        olderUserRankingDate: toDateText(dayBeforeYesterday),
      },
    }),
    isNewTab
      ? loaderClient.query({
          query: SensitiveWorksQuery,
          variables: {
            offset: 0,
            limit: 32,
            where: {
              ratings: ["R18"],
              accessTypes: ["PUBLIC"],
              orderBy: "DATE_CREATED",
              isNowCreatedAt: true,
            },
          },
        })
      : null,
    // お知らせは全年齢のトップと同じ（作品ではないので年齢区分は関係ない）
    loadHomeReleases(now.getTime()),
    // タグごとの作品も最初の HTML に入れる（拠点のキャッシュを /api/home-tag-works と共有）
    getHomeTagWorks(true).catch((): HomeTagWorksResponse => ({ rows: [] })),
  ])

  const theme = data.dailyTheme
  const {
    appEvents,
    userEvents,
    hotWorks,
    rankingWorks,
    olderRankingWorks,
    newWorksShelf,
    newUserWorksShelf,
    fillWorks,
    userRankings,
    olderUserRankings,
    ...homeData
  } = data
  const promotionWorks = data.promotionWorks.filter(isFeaturableSensitiveWork)
  const isLatestRanking = rankingWorks.length > 0
  const rankingDate = isLatestRanking ? yesterday : dayBeforeYesterday
  const creatorRankings =
    userRankings.length > 0 ? userRankings : olderUserRankings
  const promotionIds = new Set(promotionWorks.map((work) => work.id))

  return {
    ...homeData,
    ...releases,
    eventPreviews: buildHomeEventPreviews(appEvents ?? [], userEvents ?? []),
    // 選んで見せる枠には、ガイドラインに触れそうなタグの作品を出さない
    promotionWorks,
    // 推薦の最後の行の穴埋めと「ほかのおすすめ」（全年齢のトップと同じ）
    fillWorks: fillWorks
      .filter(
        (work) =>
          work.rating === "R18" &&
          isFeaturableSensitiveWork(work) &&
          !promotionIds.has(work.id),
      )
      .slice(
        0,
        Math.max(
          0,
          config.query.homeWorkCount.promotion - promotionWorks.length,
        ) + RECOMMENDED_PAD_COUNT,
      ),
    // いま人気（R18 の作品だけ。ratings を R18 にしても R18G が返ることがあるので評価でも確かめる）
    trendWorks: toSensitiveShelfWorks(hotWorks, SHELF_WORKS_COUNT),
    rankingWorks: toSensitiveShelfWorks(
      (isLatestRanking ? rankingWorks : olderRankingWorks).map(
        (award) => award.work,
      ),
      RANKING_COUNT,
    ),
    rankingDateText: `${rankingDate.getFullYear()}/${rankingDate.getMonth() + 1}/${rankingDate.getDate()}`,
    newWorksShelf: toSensitiveShelfWorks(newWorksShelf, SHELF_WORKS_COUNT),
    newUserWorksShelf: toSensitiveShelfWorks(
      newUserWorksShelf,
      SHELF_WORKS_COUNT,
    ),
    tagWorkRows: tagWorks.rows,
    topCreators: creatorRankings
      .flatMap((ranking): HomeTopCreator[] =>
        ranking.user
          ? [
              {
                id: ranking.user.id,
                login: ranking.user.login,
                name: ranking.user.name,
                iconUrl: ranking.user.iconUrl || null,
                rank: ranking.rank,
              },
            ]
          : [],
      )
      .sort((a, b) => a.rank - b.rank)
      .slice(0, RANKING_COUNT),
    // タグはガイドラインに触れそうなものを除いてから HTML に入れる
    hotSensitiveTags: data.hotSensitiveTags
      .filter((tag) => isFeaturableSensitiveTag(tag.name))
      .slice(0, HOME_HOT_TAGS_COUNT),
    recommendedTags: data.recommendedTags
      .filter((tag) => isFeaturableSensitiveTag(tag.tagName))
      .slice(0, 16),
    dailyTheme:
      theme !== null && isFeaturableSensitiveTag(theme.title) ? theme : null,
    initialNewWorks: newWorksResp?.data.works ?? null,
  }
}

// ---------- headers ----------
export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

// ---------- helper ----------
/** hook の searchParams は replaceState では変わらないので、毎回今の URL から作る */
const syncQueryParam = (key: string, value: string | null) => {
  const params = new URLSearchParams(window.location.search)
  if (value === null) {
    params.delete(key)
  } else {
    params.set(key, value)
  }
  const search = params.toString()
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${search ? `?${search}` : ""}`,
  )
}

/**
 * 画面の外にある一覧は、近づくまでレイアウト・描画を省く（全年齢のトップと同じ）
 */
const offscreenSectionStyle = (estimatedHeight: number): CSSProperties => ({
  contentVisibility: "auto",
  containIntrinsicHeight: `auto ${estimatedHeight}px`,
})

/** 新着タブの中の切り替え（全年齢のトップと同じ見た目） */
const segmentClassName =
  "h-8 rounded-full px-4 font-medium data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm"

// ---------- component ----------
/**
 * R18 のトップ。並びと見た目は全年齢のトップ（($lang)._main._index）と同じで、出す作品だけ R18 にする
 */
export default function SensitiveHomeIndexPage() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const authContext = useContext(AuthContext)

  // ------ local state ------
  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") ?? "home",
  )
  // ランキングはページを移らずタブの中で出す（URL は変えない。サーバーの描画では常に閉じている）
  const [isRankingOpen, setIsRankingOpen] = useState(false)
  const shownTab = isRankingOpen ? "ranking" : currentTab
  const [workView, setWorkView] = useState(searchParams.get("view") ?? "new")
  const [newWorksPage, setNewWorksPage] = useState(
    Number(searchParams.get("newPage") ?? 0),
  )
  const [followUserFeedPage, setFollowUserFeedPage] = useState(
    Number(searchParams.get("followUserPage") ?? 0),
  )
  const [followTagFeedPage, setFollowTagFeedPage] = useState(
    Number(searchParams.get("followTagPage") ?? 0),
  )
  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(
      (searchParams.get("workType") as IntrospectionEnum<"WorkType">) ?? null,
    )
  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(
    searchParams.get("isPromptPublic") === null
      ? null
      : searchParams.get("isPromptPublic") === "true",
  )
  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(
      (searchParams.get("sortType") as IntrospectionEnum<"WorkOrderBy">) ??
        null,
    )
  const [timeRange, setTimeRange] = useState(
    searchParams.get("timeRange") ?? "ALL",
  )
  const isOneWorkPerUser = searchParams.get("isOneWorkPerUser") === "true"

  const [internalIsPagination, setInternalIsPagination] = useState(
    searchParams.get("isPagination") !== "false",
  )

  // 作品遷移モード（ダイアログ / 直接リンク）
  const [isDialogMode, setIsDialogMode] = useState(false)

  // Work dialog URL state management
  const workDialog = useWorkDialogUrl()

  // 作品データの管理用state
  const [currentWorks, setCurrentWorks] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[]
  >([])

  // ダイアログで表示する作品データを決定
  const displayedWorks = useMemo(() => {
    switch (currentTab) {
      case "new":
      case "recommended":
      case "follow-user":
      case "follow-tag":
        return currentWorks
      default:
        return []
    }
  }, [currentTab, currentWorks])

  // 作品クリック時の処理
  const openWork = (idx: string) => {
    const work = displayedWorks.find((w) => w.id === idx)
    if (!work) {
      return
    }
    if (isDialogMode) {
      workDialog.openDialog(idx)
    } else {
      navigate(`/posts/${work.id}`)
    }
  }

  // ダイアログモード変更時の処理（localStorageに保存）
  const onChangeDialogMode = (mode: boolean) => {
    setIsDialogMode(mode)
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("aipictors-dialog-mode", JSON.stringify(mode))
      } catch (error) {
        console.error("Failed to save dialog mode to localStorage:", error)
      }
    }
    // ダイアログを閉じる
    if (!mode) {
      workDialog.closeDialog()
    }
  }

  // currentWorksを更新するコールバック関数
  const updateCurrentWorks = (
    works: FragmentOf<typeof PhotoAlbumWorkFragment>[],
  ) => {
    setCurrentWorks(works)
  }

  // ------ URL sync helpers ------
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    syncQueryParam("tab", tab)
  }
  const handleWorkViewChange = (v: string) => {
    setWorkView(v)
    syncQueryParam("view", v)
  }
  const handlePaginationChange = (isPagination: boolean) => {
    setInternalIsPagination(isPagination)
    syncQueryParam("isPagination", isPagination ? null : "false")
  }
  const handleNewWorksPageChange = (page: number) => {
    setNewWorksPage(page)
    syncQueryParam("newPage", page > 0 ? String(page) : null)
    window.scrollTo({ top: 0 })
  }
  const handleWorkTypeChange = (
    value: IntrospectionEnum<"WorkType"> | null,
  ) => {
    setWorkType(value)
    syncQueryParam("workType", value)
    handleNewWorksPageChange(0)
  }
  const handlePromptChange = (value: boolean | null) => {
    setIsPromptPublic(value)
    syncQueryParam("isPromptPublic", value === null ? null : String(value))
    handleNewWorksPageChange(0)
  }
  const handleSortChange = (value: IntrospectionEnum<"WorkOrderBy"> | null) => {
    setSortType(value)
    syncQueryParam("sortType", value)
    handleNewWorksPageChange(0)
  }
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    syncQueryParam("timeRange", value === "ALL" ? null : value)
    handleNewWorksPageChange(0)
  }

  const setPageWithParam =
    (setter: (n: number) => void, paramKey: string) => (n: number) => {
      setter(n)
      syncQueryParam(paramKey, String(n))
    }

  // ------ 右カラム（広告）。全年齢のトップと同じく、表示を引き継いだあとに取る ------
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  const shouldLoadSidebar = isMounted && currentTab === "home"
  const { data: pass } = useQuery(viewerCurrentPassQuery, {
    skip: !shouldLoadSidebar,
    fetchPolicy: "cache-first",
  })
  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    skip: !shouldLoadSidebar,
    fetchPolicy: "cache-first",
    variables: { where: { isSensitive: true, page: "work" } },
  })
  const [updateClicked] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )
  const isSubscriptionUser = ["LITE", "STANDARD", "PREMIUM"].includes(
    pass?.viewer?.currentPass?.type ?? "",
  )

  // localStorageからダイアログモードを復元
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedMode = localStorage.getItem("aipictors-dialog-mode")
        if (savedMode !== null) {
          const parsedMode = JSON.parse(savedMode)
          setIsDialogMode(parsedMode)
        }
      } catch (error) {
        console.error("Failed to restore dialog mode from localStorage:", error)
      }
    }
  }, [])

  // ---------- render ----------
  if (!data) return null

  const isEnglish = /^\/en(?:\/|$)/.test(location.pathname)
  const baseUrl = `${config.siteURL}${isEnglish ? "/en" : ""}`
  const pageName = t("R18 AIイラスト", "R18 AI Illustrations")

  const breadcrumb: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Aipictors", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: pageName,
        item: `${baseUrl}/r`,
      },
    ],
  }

  const collectionPage: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageName,
    url: `${baseUrl}/r`,
    inLanguage: isEnglish ? "en" : "ja",
    isFamilyFriendly: false,
  }

  const onResumeNewWorks = (page: number) => {
    setIsRankingOpen(false)
    handleTabChange("new")
    handleWorkViewChange("new")
    handleNewWorksPageChange(page)
  }

  const isLoggedIn = authContext.isLoggedIn

  return (
    <>
      <AppBreadcrumbScript breadcrumb={breadcrumb} />
      <AppJsonLdScript jsonLd={collectionPage} />
      <div className="space-y-4">
        {/* ページの見出し（全年齢のトップと同じく画面には出さず、検索エンジンと読み上げのために置く） */}
        <h1 className="sr-only">{pageName}</h1>
        {data.importantRelease && (
          <HomeImportantReleaseBanner release={data.importantRelease} />
        )}
        <SensitiveContinueBanner
          currentPage={
            currentTab === "new" && workView === "new" ? newWorksPage : null
          }
          onResume={onResumeNewWorks}
        />
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-3"
        >
          {/* ヘッダー部分: タブ（全年齢のトップと同じ並び。右に R18 の表示設定） */}
          <div className="-mx-4 bg-background/98 px-4 py-1">
            <div className="flex items-center justify-between gap-x-3 md:gap-x-6">
              <div className="min-w-0 flex-1">
                <AppAnimatedTabs
                  tabs={[
                    { label: t("ホーム", "Home"), value: "home" },
                    // フォロー中・お気に入りタグはログインしている人だけ（ログインしていないと中身が無い）
                    ...(isLoggedIn || currentTab === "follow-user"
                      ? [
                          {
                            label: t("フォロー中", "Following"),
                            value: "follow-user",
                          },
                        ]
                      : []),
                    { label: t("おすすめ", "For you"), value: "recommended" },
                    ...(isLoggedIn || currentTab === "follow-tag"
                      ? [
                          {
                            label: t("お気に入りタグ", "Favorite tags"),
                            value: "follow-tag",
                          },
                        ]
                      : []),
                    { label: t("ランキング", "Ranking"), value: "ranking" },
                    { label: t("新着", "New"), value: "new" },
                  ]}
                  value={shownTab}
                  onChange={(tab) => {
                    if (tab === "ranking") {
                      setIsRankingOpen(true)
                      return
                    }
                    // 今のタブを押したときは、ランキングを閉じるだけ
                    setIsRankingOpen(false)
                    if (tab !== currentTab) {
                      handleTabChange(tab)
                    }
                  }}
                  variant="pill"
                />
              </div>
              <SensitiveDisplaySettings isCompact />
            </div>
          </div>

          {/* ---------- ランキング（ページを移らずに出す。R18 の集計） ---------- */}
          {isRankingOpen && <HomeRankingTabContent isSensitive />}
          {/* ランキングを開いている間も、元のタブの中身は消さずに隠す（戻ったときに読み直さない） */}
          <div className={isRankingOpen ? "hidden" : "contents"}>
            {/* ---------- HOME ---------- */}
            <TabsContent value="home" className="m-0 flex flex-col space-y-4">
              {/* 今日のお題を先頭にしたタグの横並び */}
              {(data.dailyTheme || data.hotSensitiveTags.length > 0) && (
                <HomeTagList
                  isSensitive
                  themeTitle={data.dailyTheme?.title}
                  themeEnTitle={data.dailyTheme?.enTitle}
                  hotTags={data.hotSensitiveTags}
                />
              )}
              <div className="block space-y-4 md:flex md:space-x-6 md:space-y-0">
                <div className="flex w-full min-w-0 flex-col space-y-6 md:max-w-[calc(100%_-_286px)] md:space-y-8">
                  {/* お知らせ（開催中のイベント・サイトのお知らせ）は一番上 */}
                  <HomeQuickPreviewBar
                    events={data.eventPreviews}
                    featuredReleases={data.featuredReleaseList}
                    releaseList={data.releaseList}
                  />
                  {/* クリエイターの宣伝（PR）とユーザからの推薦 */}
                  {/* 宣伝枠の空いたマスは、おすすめの末尾の作品で埋める（その作品は下の推薦・ほかのおすすめには出さない） */}
                  <HomePromotionWorksSection
                    isSensitive
                    fillWorks={data.fillWorks.slice(-PROMOTION_FILL_COUNT)}
                  />
                  <HomeSensitiveWorksUsersRecommendedSection
                    works={data.promotionWorks}
                    fillWorks={data.fillWorks.slice(0, -PROMOTION_FILL_COUNT)}
                  />
                  {/* ここから下は全年齢のトップと同じく、作品の一覧を何段も続ける（いま人気 → ランキング → タグごと → 新着） */}
                  <HomeWorksShelf
                    title={t("いま人気", "Trending now")}
                    description={t(
                      "いま反応が集まっている作品",
                      "Works getting reactions right now",
                    )}
                    link="/r/popular"
                    works={data.trendWorks}
                    imageWidth={320}
                    isSensitive
                  />
                  {data.rankingWorks.length > 0 && (
                    <HomeWorksShelf
                      title={t(
                        `デイリーランキング（${data.rankingDateText.slice(5)}）`,
                        `Daily ranking (${data.rankingDateText.slice(5)})`,
                      )}
                      link={`/r/rankings/${data.rankingDateText}`}
                      works={data.rankingWorks}
                      showRank
                      isSensitive
                    />
                  )}
                  <div style={offscreenSectionStyle(2400)}>
                    {data.tagWorkRows.length > 0 ? (
                      <HomeTagWorksSection
                        isSensitive
                        initialRows={data.tagWorkRows}
                      />
                    ) : (
                      <HomeDeferredSection
                        fallback={<HomeTagWorksPlaceholder />}
                      >
                        <HomeTagWorksSection isSensitive />
                      </HomeDeferredSection>
                    )}
                  </div>
                  <HomeWorksShelf
                    title={t("新着作品", "New works")}
                    link="/r?tab=new"
                    works={data.newWorksShelf}
                    isSensitive
                  />
                  {/* 作品以外の入口（モデル・人気のクリエイター） */}
                  <HomeModelLinks isSensitive />
                  <HomeTopCreators creators={data.topCreators} isSensitive />
                  {/* 新規クリエイターとその初投稿作品。新規クリエイターは PC では右カラムの新規コメントの上に出すので、ここはスマホだけ */}
                  <HomeNewCreators
                    className="md:hidden"
                    users={data.newPostedUsers}
                    isSensitive
                  />
                  <HomeWorksShelf
                    title={t(
                      "新規クリエイターの初投稿作品",
                      "New creators' first works",
                    )}
                    description={t(
                      "はじめて投稿した人の作品です。いいねで応援しよう",
                      "First posts from new creators. Cheer them on with a like",
                    )}
                    link="/r?tab=new&view=new-user"
                    works={data.newUserWorksShelf}
                    isSensitive
                  />
                  <div className="space-y-3">
                    {data.dailyTheme && (
                      // 参加数と先頭の作品は全年齢を含むので出さない
                      <HomeDailyThemeCard
                        isSensitive
                        theme={{
                          ...data.dailyTheme,
                          worksCount: null,
                          firstWork: null,
                        }}
                      />
                    )}
                    <HomeQuickLinks isSensitive />
                  </div>
                </div>
                {/* 右カラム（スクロールしても見えるように固定）。PC だけ新しいユーザー・コメント・人気タグも */}
                <HomeSidebar
                  isSensitive
                  advertisements={advertisements}
                  onClickAdvertisement={async () => {
                    const id = advertisements?.randomCustomerAdvertisement?.id
                    if (id) await updateClicked({ variables: { id } })
                  }}
                  isSubscriptionUser={isSubscriptionUser}
                  isHomeSidebarLoading={false}
                  sidebarNewPostedUsers={data.newPostedUsers}
                  sidebarNewComments={data.newComments}
                  recommendedTags={data.recommendedTags}
                />
              </div>
              <SensitiveHomeAbout />
            </TabsContent>

            {/* ---------- おすすめ ---------- */}
            <TabsContent value="recommended" className="space-y-6">
              {currentTab === "recommended" && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-bold text-base">
                      {isLoggedIn
                        ? t("あなたへのおすすめ", "For you")
                        : t("いま人気の新着", "Trending new works")}
                    </h2>
                    <HomeViewModeToggles
                      isDialogMode={isDialogMode}
                      onDialogModeChange={onChangeDialogMode}
                    />
                  </div>
                  <RecommendedFeedContents
                    isSensitive
                    initialWorks={[]}
                    onSelect={isDialogMode ? openWork : undefined}
                    updateWorks={updateCurrentWorks}
                  />
                </>
              )}
            </TabsContent>

            {/* ---------- 新着 / 新規ユーザ ---------- */}
            <TabsContent value="new" className="flex flex-col space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex w-fit flex-wrap gap-0.5 rounded-full border bg-muted/40 p-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleWorkViewChange("new")}
                    data-active={workView === "new"}
                    aria-pressed={workView === "new"}
                    className={segmentClassName}
                  >
                    {t("新着", "New")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleWorkViewChange("new-user")}
                    data-active={workView === "new-user"}
                    aria-pressed={workView === "new-user"}
                    className={segmentClassName}
                  >
                    {t("新規ユーザ", "New Users")}
                  </Button>
                </div>
                <HomeViewModeToggles
                  isPagination={
                    workView === "new-user" ? undefined : internalIsPagination
                  }
                  onPaginationChange={handlePaginationChange}
                  isDialogMode={isDialogMode}
                  onDialogModeChange={onChangeDialogMode}
                />
              </div>

              {workView === "new" && (
                <>
                  <SensitiveWorksFilterBar
                    workType={workType}
                    onChangeWorkType={handleWorkTypeChange}
                    isPromptPublic={isPromptPublic}
                    onChangeIsPromptPublic={handlePromptChange}
                    sortType={sortType}
                    onChangeSortType={handleSortChange}
                    timeRange={timeRange}
                    onChangeTimeRange={handleTimeRangeChange}
                  />

                  <Suspense fallback={<AppLoadingPage />}>
                    {internalIsPagination ? (
                      <HomePaginationSensitiveWorksSection
                        page={newWorksPage}
                        setPage={handleNewWorksPageChange}
                        workType={workType}
                        isPromptPublic={isPromptPublic}
                        sortType={sortType}
                        timeRange={timeRange}
                        isOneWorkPerUser={isOneWorkPerUser}
                        onSelect={isDialogMode ? openWork : undefined}
                        updateWorks={updateCurrentWorks}
                        initialWorks={data.initialNewWorks}
                      />
                    ) : (
                      <HomeSensitiveWorksSection
                        page={newWorksPage}
                        setPage={handleNewWorksPageChange}
                        workType={workType}
                        isPromptPublic={isPromptPublic}
                        sortType={sortType}
                        timeRange={timeRange}
                        isPagination={false}
                        onSelect={isDialogMode ? openWork : undefined}
                        updateWorks={updateCurrentWorks}
                      />
                    )}
                  </Suspense>
                </>
              )}

              {workView === "new-user" && (
                <>
                  <SensitiveWorksFilterBar
                    workType={workType}
                    onChangeWorkType={handleWorkTypeChange}
                    isPromptPublic={isPromptPublic}
                    onChangeIsPromptPublic={handlePromptChange}
                    sortType={sortType}
                    onChangeSortType={handleSortChange}
                  />
                  <Suspense fallback={<AppLoadingPage />}>
                    <HomeNewUsersSensitiveWorkListSection
                      workType={workType}
                      isPromptPublic={isPromptPublic}
                      sortType={sortType}
                      isOneWorkPerUser={isOneWorkPerUser}
                      onSelect={isDialogMode ? openWork : undefined}
                      updateWorks={updateCurrentWorks}
                    />
                  </Suspense>
                </>
              )}
            </TabsContent>

            {/* ---------- フォロー中 ---------- */}
            <TabsContent value="follow-user" className="space-y-4">
              <HomeViewModeToggles
                className="justify-end"
                isPagination={internalIsPagination}
                onPaginationChange={handlePaginationChange}
                isDialogMode={isDialogMode}
                onDialogModeChange={onChangeDialogMode}
              />
              <Suspense fallback={<AppLoadingPage />}>
                <FollowSensitiveUserFeedContents
                  page={followUserFeedPage}
                  setPage={setPageWithParam(
                    setFollowUserFeedPage,
                    "followUserPage",
                  )}
                  isPagination={internalIsPagination}
                  onPaginationModeChange={setInternalIsPagination}
                  onSelect={isDialogMode ? openWork : undefined}
                  updateWorks={updateCurrentWorks}
                />
              </Suspense>
            </TabsContent>

            {/* ---------- お気に入りタグ ---------- */}
            <TabsContent value="follow-tag" className="space-y-4">
              <HomeViewModeToggles
                className="justify-end"
                isPagination={internalIsPagination}
                onPaginationChange={handlePaginationChange}
                isDialogMode={isDialogMode}
                onDialogModeChange={onChangeDialogMode}
              />
              <Suspense fallback={<AppLoadingPage />}>
                <FollowSensitiveTagsFeedContents
                  page={followTagFeedPage}
                  setPage={setPageWithParam(
                    setFollowTagFeedPage,
                    "followTagPage",
                  )}
                  isPagination={internalIsPagination}
                  onSelect={isDialogMode ? openWork : undefined}
                  updateWorks={updateCurrentWorks}
                />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* ────────── 作品ダイアログ ────────── */}
      {workDialog.isOpen && workDialog.workId && (
        <WorkViewerDialog
          works={displayedWorks}
          startWorkId={workDialog.workId}
          onClose={workDialog.closeDialog}
          hasNextPage={false}
          isLoadingMore={false}
        />
      )}
    </>
  )
}

const query = graphql(
  `query SensitiveHomeQuery(
    $year: Int!
    $month: Int!
    $day: Int!
    $promotionWorksLimit: Int!
    $hotWorksAfter: String!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
    $olderAwardYear: Int!
    $olderAwardMonth: Int!
    $olderAwardDay: Int!
    $userRankingDate: String!
    $olderUserRankingDate: String!
  ) {
    rankingWorks: workAwards(
      offset: 0
      limit: 20
      where: { year: $awardYear, month: $awardMonth, day: $awardDay, isSensitive: true }
    ) {
      id
      work {
        ...HomeTagRowWork
        rating
        tagNames
      }
    }
    olderRankingWorks: workAwards(
      offset: 0
      limit: 20
      where: { year: $olderAwardYear, month: $olderAwardMonth, day: $olderAwardDay, isSensitive: true }
    ) {
      id
      work {
        ...HomeTagRowWork
        rating
        tagNames
      }
    }
    newWorksShelf: works(
      offset: 0
      limit: 40
      where: {
        ratings: [R18]
        isSensitive: true
        isNowCreatedAt: true
        orderBy: DATE_CREATED
        accessTypes: [PUBLIC]
      }
    ) {
      ...HomeTagRowWork
      rating
      tagNames
    }
    newUserWorksShelf: newUserWorks(
      offset: 0
      limit: 40
      where: { ratings: [R18], isSensitive: true, isNowCreatedAt: true }
    ) {
      ...HomeTagRowWork
      rating
      tagNames
    }
    fillWorks: recommendedFeedWorks(offset: 0, limit: 32, ratings: [R18]) {
      ...HomePromotionWork
      rating
      tagNames
    }
    userRankings: sensitiveUserRankings(
      offset: 0
      limit: 12
      where: { date: $userRankingDate, orderBy: RANK, sort: ASC }
    ) {
      rank
      user {
        id
        login
        name
        iconUrl
      }
    }
    olderUserRankings: sensitiveUserRankings(
      offset: 0
      limit: 12
      where: { date: $olderUserRankingDate, orderBy: RANK, sort: ASC }
    ) {
      rank
      user {
        id
        login
        name
        iconUrl
      }
    }
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
      enTitle
      year
      month
      day
    }
    hotSensitiveTags {
      ...HomeTagListItem
    }
    hotWorks: works(
      offset: 0
      limit: 40
      where: {
        ratings: [R18]
        isSensitive: true
        isNowCreatedAt: true
        orderBy: LIKES_COUNT
        createdAtAfter: $hotWorksAfter
      }
    ) {
      ...HomeHotWork
      tagNames
    }
    recommendedTags: recommendedTags(
      limit: 40
      where: {
        isSensitive: true,
      }
    ) {
      ...HomeTag
    }
    newPostedUsers: newPostedUsers(
      offset: 0,
      limit: 12,
      where: {
        isSensitive: true,
      }
    ) {
      ...HomeNewPostedUsers
    }
    newComments: newComments(
      offset: 0,
      limit: 8,
      where: {
        isSensitive: true,
        isTextOnly: true,
        ratings: [R18],
      }
    ) {
      ...HomeNewComments
    }
    promotionWorks: works(
      offset: 0,
      limit: $promotionWorksLimit,
      where: {
        isRecommended: true
        isNowCreatedAt: true
        ratings: [R18]
      }
    ) {
      ...HomePromotionWork
      tagNames
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
    HomePromotionWorkFragment,
    HomeTagListItemFragment,
    HomeHotWorkFragment,
    HomeTagFragment,
    HomeNewPostedUsersFragment,
    HomeNewCommentsFragment,
    HomeTagRowWorkFragment,
  ],
)
