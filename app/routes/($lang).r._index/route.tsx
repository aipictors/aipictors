import { useMutation, useQuery } from "@apollo/client/index"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@remix-run/react"
import { type FragmentOf, graphql } from "gql.tada"
import { Suspense, useContext, useEffect, useMemo, useState } from "react"
import type { BreadcrumbList, CollectionPage, WithContext } from "schema-dts"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"
import { AppBreadcrumbScript } from "~/components/app/app-breadcrumb-script"
import { AppJsonLdScript } from "~/components/app/app-jsonld-script"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent } from "~/components/ui/tabs"
import { WorkViewerDialog } from "~/components/work/lazy-work-viewer-dialog"
import { config, META } from "~/config"
import { AuthContext } from "~/contexts/auth-context"
import { useTranslation } from "~/hooks/use-translation"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { FollowSensitiveTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-tags-feed-contents"
import { FollowSensitiveUserFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-user-feed-contents"
import { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewSensitiveUsersSection } from "~/routes/($lang)._main._index/components/home-new-sensitive-users-section"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import { HomeNewUsersWorksFragment } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeSensitiveAwardWorkSection } from "~/routes/($lang)._main._index/components/home-sensitive-award-work-section"
import { HomeSensitiveNewCommentsSection } from "~/routes/($lang)._main._index/components/home-sensitive-new-comments"
import { HomeSensitiveNewUsersWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-new-users-works-section"
import { HomeSensitiveTagsSection } from "~/routes/($lang)._main._index/components/home-sensitive-tags-section"
import { HomeSensitiveWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-section"
import { HomeSensitiveWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-users-recommended-section"
import { HomeTagListItemFragment } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeNewUsersSensitiveWorkListSection } from "~/routes/($lang).r._index/components/home-new-user-sensitive-work-list-section"
import {
  HomePaginationSensitiveWorksSection,
  SensitiveWorksQuery,
} from "~/routes/($lang).r._index/components/home-pagination-sensitive-works-section"
import { HomeSensitiveTagList } from "~/routes/($lang).r._index/components/home-sensitive-tag-list"
import { SensitiveContinueBanner } from "~/routes/($lang).r._index/components/sensitive-continue-banner"
import { SensitiveHomeAbout } from "~/routes/($lang).r._index/components/sensitive-home-about"
import { SensitiveHomeHeader } from "~/routes/($lang).r._index/components/sensitive-home-header"
import { SensitiveViewModeToggle } from "~/routes/($lang).r._index/components/sensitive-view-mode-toggle"
import { SensitiveWorksFilterBar } from "~/routes/($lang).r._index/components/sensitive-works-filter-bar"
import { createSensitiveMeta } from "~/utils/create-sensitive-meta"
import { getJstDate } from "~/utils/jst-date"
import { isSuggestableSensitiveTag } from "~/utils/sensitive-tag-filter"

// ---------- meta ----------
export const meta: MetaFunction = (props) =>
  createSensitiveMeta(META.HOME_SENSITIVE, undefined, props.params.lang)

// ---------- utils ----------
const getUtcDateString = (d: Date) =>
  `${d.getUTCFullYear()}/${`0${d.getUTCMonth() + 1}`.slice(-2)}/${`0${d.getUTCDate()}`.slice(-2)}`

// ---------- loader ----------
export async function loader(props: LoaderFunctionArgs) {
  const now = getJstDate()
  const yesterday = new Date(now.getTime() - 86_400_000)
  const url = new URL(props.request.url)

  // 新着タブで開いたときは、ファーストビューの作品もサーバーの HTML に入れる
  const isNewTab = url.searchParams.get("tab") === "new"

  const [{ data }, newWorksResp] = await Promise.all([
    loaderClient.query({
      query,
      variables: {
        awardDay: yesterday.getDate(),
        awardMonth: yesterday.getMonth() + 1,
        awardYear: yesterday.getFullYear(),
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        promotionWorksLimit: config.query.homeWorkCount.promotion,
        awardWorksLimit: config.query.homeWorkCount.award,
        newUsersWorksLimit: config.query.homeWorkCount.newUser,
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
  ])

  const themeTitle = data.dailyTheme?.title ?? null

  return {
    ...data,
    // タグはガイドラインに触れそうなものを除いてから HTML に入れる
    hotSensitiveTags: data.hotSensitiveTags.filter((tag) =>
      isSuggestableSensitiveTag(tag.name),
    ),
    recommendedTags: data.recommendedTags
      .filter((tag) => isSuggestableSensitiveTag(tag.tagName))
      .slice(0, 16),
    themeTitle:
      themeTitle !== null && isSuggestableSensitiveTag(themeTitle)
        ? themeTitle
        : null,
    awardDateText: getUtcDateString(yesterday),
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

// ---------- component ----------
export default function Index() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const authContext = useContext(AuthContext)

  // ------ local state ------
  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") ?? (authContext.isLoggedIn ? "new" : "home"),
  )
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
      case "follow-user":
      case "follow-tag":
        return currentWorks
      default:
        return []
    }
  }, [currentTab, currentWorks])

  // 作品クリック時の処理
  const openWork = (idx: string) => {
    // displayedWorksのworkのid一致するもの
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

  // ------ GraphQL for side‐menu ads ------
  const { data: pass } = useQuery(viewerCurrentPassQuery)
  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    variables: { where: { isSensitive: true, page: "work" } },
  })
  const [updateClicked] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )
  const isSubscriptionUser = ["LITE", "STANDARD", "PREMIUM"].includes(
    pass?.viewer?.currentPass?.type ?? "",
  )

  useEffect(() => {
    if (authContext.isLoading || searchParams.has("tab")) {
      return
    }

    if (!authContext.isLoggedIn || currentTab !== "home") {
      return
    }

    setCurrentTab("new")
  }, [authContext.isLoading, authContext.isLoggedIn, currentTab, searchParams])

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
    handleTabChange("new")
    handleWorkViewChange("new")
    handleNewWorksPageChange(page)
  }

  return (
    <>
      <AppBreadcrumbScript breadcrumb={breadcrumb} />
      <AppJsonLdScript jsonLd={collectionPage} />
      <div className="space-y-4">
        <SensitiveHomeHeader themeTitle={data.themeTitle} />
        <SensitiveContinueBanner
          currentPage={
            currentTab === "new" && workView === "new" ? newWorksPage : null
          }
          onResume={onResumeNewWorks}
        />
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-4"
        >
          {/* ---------- TAB HEADER ---------- */}
          <div className="flex items-center sm:gap-x-2 md:gap-x-4">
            <AppAnimatedTabs
              tabs={[
                { label: t("おすすめ", "For you"), value: "home" },
                { label: t("新着", "New"), value: "new" },
                { label: t("フォロー", "Following"), value: "follow-user" },
                {
                  label: t("お気に入りタグ", "Favorite tags"),
                  value: "follow-tag",
                },
              ]}
              value={currentTab}
              onChange={handleTabChange}
            />
          </div>

          {/* ---------- HOME ---------- */}
          <TabsContent value="home" className="m-0 flex flex-col space-y-4">
            <HomeSensitiveTagList hotTags={data.hotSensitiveTags} />
            <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
              {/* left */}
              <div className="flex w-full min-w-0 flex-col space-y-6">
                <HomeSensitiveWorksUsersRecommendedSection
                  works={data.promotionWorks}
                />
                <HomeSensitiveAwardWorkSection
                  awardDateText={data.awardDateText}
                  title={t("前日のランキング", "Yesterday's Ranking")}
                  awards={data.workAwards}
                />
                <HomeSensitiveTagsSection
                  title={t("人気のタグ", "Popular Tags")}
                  tags={data.recommendedTags}
                />
                <HomeSensitiveNewUsersWorksSection works={data.newUserWorks} />
              </div>

              {/* right */}
              <Separator
                orientation="vertical"
                className="hidden h-[100vh] w-[1px] md:block"
              />
              <div className="flex w-full flex-col space-y-4 md:max-w-80">
                {!isSubscriptionUser &&
                  advertisements?.randomCustomerAdvertisement && (
                    <div className="relative border">
                      <Link
                        to={advertisements.randomCustomerAdvertisement.url}
                        target="_blank"
                        onClick={() => {
                          const id =
                            advertisements.randomCustomerAdvertisement?.id
                          if (!id) return
                          updateClicked({
                            variables: {
                              id,
                            },
                          })
                        }}
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

                {data.newPostedUsers && (
                  <HomeNewSensitiveUsersSection users={data.newPostedUsers} />
                )}
                {data.newComments?.length > 0 && (
                  <HomeSensitiveNewCommentsSection
                    comments={data.newComments}
                  />
                )}
              </div>
            </div>
            <SensitiveHomeAbout />
          </TabsContent>

          {/* ---------- NEW / NEW-USER ---------- */}
          <TabsContent value="new" className="flex flex-col space-y-4">
            {/* toggle buttons */}
            <div className="flex space-x-2">
              {[
                { v: "new", label: t("すべての新着", "All new") },
                { v: "new-user", label: t("新規クリエイター", "New creators") },
              ].map(({ v, label }) => (
                <Button
                  key={v}
                  size="sm"
                  variant={workView === v ? "default" : "secondary"}
                  aria-pressed={workView === v}
                  onClick={() => handleWorkViewChange(v)}
                >
                  {label}
                </Button>
              ))}
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
                >
                  <SensitiveViewModeToggle
                    isPagination={internalIsPagination}
                    onChangePagination={handlePaginationChange}
                    isDialogMode={isDialogMode}
                    onChangeDialogMode={onChangeDialogMode}
                  />
                </SensitiveWorksFilterBar>

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
                >
                  <SensitiveViewModeToggle
                    isDialogMode={isDialogMode}
                    onChangeDialogMode={onChangeDialogMode}
                  />
                </SensitiveWorksFilterBar>
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

          {/* ---------- FOLLOW USER ---------- */}
          <TabsContent value="follow-user" className="space-y-4">
            <SensitiveViewModeToggle
              isPagination={internalIsPagination}
              onChangePagination={handlePaginationChange}
              isDialogMode={isDialogMode}
              onChangeDialogMode={onChangeDialogMode}
            />

            {/* コンテンツ */}
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

          {/* ---------- FOLLOW TAG ---------- */}
          <TabsContent value="follow-tag" className="space-y-4">
            <SensitiveViewModeToggle
              isPagination={internalIsPagination}
              onChangePagination={handlePaginationChange}
              isDialogMode={isDialogMode}
              onChangeDialogMode={onChangeDialogMode}
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
  `query HomeQuery(
    # $pastGenerationBefore: String!
    $year: Int!
    $month: Int!
    $day: Int!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
    # $novelWorksLimit: Int!
    # $novelWorksBefore: String!
    # $columnWorksLimit: Int!
    # $columnWorksBefore: String!
    # $generationWorksLimit: Int!
    $promotionWorksLimit: Int!
    $awardWorksLimit: Int!
    $newUsersWorksLimit: Int!
  ) {
    dailyTheme(year: $year, month: $month, day: $day) {
      id
      title
    }
    hotSensitiveTags {
      ...HomeTagListItem
    }
    workAwards(
      offset: 0
      limit: $awardWorksLimit
      where: {
        year: $awardYear
        month: $awardMonth
        day: $awardDay
        isSensitive: true
      }
    ) {
      ...HomeWorkAward
    }
    recommendedTags: recommendedTags(
      limit: 40
      where: {
        isSensitive: true,
      }
    ) {
      ...HomeTag
    }
    newUserWorks: newUserWorks(
      offset: 0,
      limit: $newUsersWorksLimit,
      where: {
        ratings: [R18],
      }
    ) {
      ...HomeNewUsersWorks
    }
    newPostedUsers: newPostedUsers(
      offset: 0,
      limit: 8,
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
    }
    # novelWorks: works(
    #   offset: 0,
    #   limit: $novelWorksLimit,
    #   where: {
    #     ratings: [G, R15],
    #     workType: NOVEL,
    #     beforeCreatedAt: $novelWorksBefore
    #   }
    # ) {
    #   ...HomeNovelPost
    # }
    # columnWorks: works(
    #   offset: 0,
    #   limit: $columnWorksLimit,
    #   where: {
    #     ratings: [G, R15],
    #     workType: COLUMN,
    #     beforeCreatedAt: $columnWorksBefore
    #   }
    # ) {
    #   ...HomeColumnPost
    # }
  }`,
  [
    HomePromotionWorkFragment,
    // HomeNovelPostFragment,
    HomeTagListItemFragment,
    // HomeGenerationWorkFragment,
    HomeWorkAwardFragment,
    // HomeColumnPostFragment,
    HomeTagFragment,
    HomeNewUsersWorksFragment,
    HomeNewPostedUsersFragment,
    HomeNewCommentsFragment,
  ],
)

const viewerCurrentPassQuery = graphql(
  `query ViewerCurrentPass {
    viewer {
      id
      currentPass {
        id
        type
      }
    }
  }`,
)

export const SideMenuAdvertisementsFragment = graphql(
  `fragment SideMenuAdvertisementsFields on CustomerAdvertisementNode @_unmask {
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
  }`,
)

const randomCustomerAdvertisementQuery = graphql(
  `query RandomCustomerAdvertisement($where: RandomCustomerAdvertisementWhereInput!) {
    randomCustomerAdvertisement(where: $where) {
      ...SideMenuAdvertisementsFields
    }
  }`,
  [SideMenuAdvertisementsFragment],
)

const updateClickedCountCustomerAdvertisementMutation = graphql(
  `mutation UpdateClickedCountCustomerAdvertisement($id: ID!) {
    updateClickedCountCustomerAdvertisement(id: $id) {
      id
    }
  }`,
)
