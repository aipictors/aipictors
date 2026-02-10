import { useMutation, useQuery } from "@apollo/client/index"
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
import { type FragmentOf, graphql } from "gql.tada"
import {
  ArrowDownWideNarrow,
  ExternalLink,
  List,
  Navigation,
  PlaySquare,
} from "lucide-react"
import { Suspense, useEffect, useMemo, useState } from "react"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import type { PhotoAlbumWorkFragment } from "~/components/responsive-photo-works-album"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent } from "~/components/ui/tabs"
import { WorkViewerDialog } from "~/components/work/work-viewer-dialog"
import { config, META } from "~/config"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import { useWorkDialogUrl } from "~/hooks/use-work-dialog-url"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { loaderClient } from "~/lib/loader-client"
import { FollowSensitiveTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-tags-feed-contents"
import { FollowSensitiveUserFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-user-feed-contents"
import { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { HomeAwardWorksSection } from "~/routes/($lang)._main._index/components/home-award-works"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewSensitiveUsersSection } from "~/routes/($lang)._main._index/components/home-new-sensitive-users-section"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import { HomeNewUsersWorksFragment } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeSensitiveAwardWorkSection } from "~/routes/($lang)._main._index/components/home-sensitive-award-work-section"
import { HomeSensitiveHotWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-hot-works-section"
import { HomeSensitiveNewCommentsSection } from "~/routes/($lang)._main._index/components/home-sensitive-new-comments"
import { HomeSensitiveNewUsersWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-new-users-works-section"
import { HomeSensitiveTagsSection } from "~/routes/($lang)._main._index/components/home-sensitive-tags-section"
import { HomeSensitiveWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-section"
import { HomeSensitiveWorksTagSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-tag-section"
import { HomeSensitiveWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-users-recommended-section"
import { HomeTagListItemFragment } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import { HomeNewUsersSensitiveWorkListSection } from "~/routes/($lang).r._index/components/home-new-user-sensitive-work-list-section"
import { HomePaginationSensitiveWorksSection } from "~/routes/($lang).r._index/components/home-pagination-sensitive-works-section"
import { HomeSensitiveTagList } from "~/routes/($lang).r._index/components/home-sensitive-tag-list"
import { createMeta } from "~/utils/create-meta"
import { getJstDate } from "~/utils/jst-date"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"

// ---------- meta ----------
export const meta: MetaFunction = (props) =>
  createMeta(META.HOME_SENSITIVE, undefined, props.params.lang)

// ---------- utils ----------
const getUtcDateString = (d: Date) =>
  `${d.getUTCFullYear()}/${`0${d.getUTCMonth() + 1}`.slice(-2)}/${`0${d.getUTCDate()}`.slice(-2)}`

// ---------- loader ----------
export async function loader(_props: LoaderFunctionArgs) {
  const categories = ["縄", "中だし"]
  const pick2 = (arr: string[]) =>
    arr.sort(() => Math.random() - 0.5).slice(0, 2)

  const [firstTag, secondTag] = pick2(categories)
  const now = getJstDate()
  const yesterday = new Date(now.getTime() - 86_400_000)

  const { data } = await loaderClient.query({
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
      categoryFirst: firstTag,
      categorySecond: secondTag,
      tagWorksLimit: config.query.homeWorkCount.tag,
      newUsersWorksLimit: config.query.homeWorkCount.newUser,
    },
  })

  return {
    ...data,
    awardDateText: getUtcDateString(yesterday),
    firstTag,
    secondTag,
  }
}

// ---------- headers ----------
export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

// ---------- helper ----------
const useUpdateQueryParams = () => (p: URLSearchParams) =>
  window.history.replaceState(null, "", `${location.pathname}?${p}`)

// ---------- component ----------
export default function Index() {
  const data = useLoaderData<typeof loader>()
  const t = useTranslation()
  const locale = useLocale()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const updateQueryParams = useUpdateQueryParams()

  // ------ local state ------
  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") ?? "home",
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
  const [isOneWorkPerUser, _setIsOneWorkPerUser] = useState<boolean>(
    searchParams.get("isOneWorkPerUser") === "true",
  )

  const [internalIsPagination, setInternalIsPagination] = useState(true)

  // 作品遷移モード（ダイアログ / 直接リンク）
  const [isDialogMode, setIsDialogMode] = useState(false)

  // Work dialog URL state management
  const workDialog = useWorkDialogUrl()

  // 作品データの管理用state
  const [currentWorks, setCurrentWorks] = useState<
    FragmentOf<typeof PhotoAlbumWorkFragment>[]
  >([])

  const [isLoadingMore, _setIsLoadingMore] = useState(false)

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

  const [hasNextPage, _setHasNextPage] = useState(true)

  // 作品クリック時の処理
  const openWork = (idx: string) => {
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

  // 無限スクロール用のloadMore関数
  const loadMore = async () => {
    if (isLoadingMore || !hasNextPage || internalIsPagination) return
  }

  // ------ URL sync helpers ------
  const syncParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams)
    value === null ? p.delete(key) : p.set(key, value)
    updateQueryParams(p)
  }

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    syncParam("tab", tab)
  }
  const handleWorkViewChange = (v: string) => {
    setWorkView(v)
    syncParam("view", v)
  }

  const setPageWithParam =
    (setter: (n: number) => void, paramKey: string) => (n: number) => {
      setter(n)
      syncParam(paramKey, String(n))
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

  return (
    <>
      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        {/* ---------- TAB HEADER ---------- */}
        <div className="flex items-center sm:gap-x-2 md:gap-x-4">
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
          <Button variant="secondary" size="sm" onClick={() => navigate("/")}>
            全年齢
          </Button>
        </div>

        {/* ---------- HOME ---------- */}
        <TabsContent value="home" className="m-0 flex flex-col space-y-4">
          <HomeSensitiveTagList
            themeTitle={data.dailyTheme?.title}
            hotTags={data.hotSensitiveTags}
          />
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            {/* left */}
            <div className="flex w-full flex-col space-y-4 ">
              <HomeSensitiveWorksUsersRecommendedSection
                works={data.promotionWorks}
              />
              <HomeSensitiveNewUsersWorksSection works={data.newUserWorks} />
              <HomeSensitiveAwardWorkSection
                awardDateText={data.awardDateText}
                title={t("前日ランキング", "Previous Day Ranking")}
                awards={data.workAwards}
              />
              <HomeSensitiveWorksTagSection
                tag={data.firstTag}
                works={data.firstTagWorks}
                secondTag={data.secondTag}
                secondWorks={data.secondTagWorks}
                isCropped
              />
              <HomeSensitiveTagsSection
                title={t("人気タグ", "Popular Tags")}
                tags={data.recommendedTags}
              />
            </div>

            {/* right */}
            <Separator
              orientation="vertical"
              className="hidden h-[100vh] w-[1px] md:block"
            />
            <div className="flex w-full max-w-80 flex-col space-y-4">
              <Button
                onClick={() => navigate("/")}
                variant="secondary"
                className="w-full"
              >
                {t("全年齢", "All Ages")}
              </Button>

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
                <HomeSensitiveNewCommentsSection comments={data.newComments} />
              )}
              {data.workAwards && (
                <HomeAwardWorksSection works={data.workAwards} />
              )}
            </div>
          </div>
        </TabsContent>

        {/* ---------- NEW / POPULAR / NEW-USER ---------- */}
        <TabsContent value="new" className="flex flex-col space-y-4">
          {/* toggle buttons */}
          <div className="flex space-x-4">
            {[
              { v: "new", label: t("新着", "New") },
              // { v: "popular", label: t("人気", "Popular") },
              { v: "new-user", label: t("新規ユーザ", "New Users") },
            ].map(({ v, label }) => (
              <Button
                key={v}
                variant={workView === v ? "default" : "secondary"}
                onClick={() => handleWorkViewChange(v)}
              >
                {label}
                {v === "popular" && (
                  <CrossPlatformTooltip
                    text={t(
                      "最近投稿された人気作品が表示されます",
                      "Recently popular works",
                    )}
                  />
                )}
              </Button>
            ))}
          </div>

          {/* filters (only on “new”) */}
          {workView === "new" && (
            <>
              <div className="space-y-4">
                {/* 絞り込み用のセレクト群 - レスポンシブレイアウト */}
                <div className="space-y-3">
                  {/* フィルター行1: 種類、プロンプト、ソート */}
                  <div className="grid grid-cols-3 gap-2 md:flex md:space-x-4">
                    {/* type */}
                    <Select
                      value={workType ?? ""}
                      onValueChange={(v) => {
                        setWorkType(v === "ALL" ? null : (v as any))
                        syncParam("workType", v === "ALL" ? null : v)
                      }}
                    >
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue
                          placeholder={
                            workType
                              ? toWorkTypeText({ type: workType, lang: locale })
                              : t("種類", "Type")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {["ALL", "WORK", "VIDEO", "NOVEL", "COLUMN"].map(
                          (v) => (
                            <SelectItem key={v} value={v}>
                              {t(
                                v === "WORK"
                                  ? "画像"
                                  : v === "VIDEO"
                                    ? "動画"
                                    : v === "NOVEL"
                                      ? "小説"
                                      : v === "COLUMN"
                                        ? "コラム"
                                        : "種類",
                                v,
                              )}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    {/* prompt */}
                    <Select
                      value={
                        isPromptPublic === null
                          ? "ALL"
                          : isPromptPublic
                            ? "prompt"
                            : "no-prompt"
                      }
                      onValueChange={(v) => {
                        setIsPromptPublic(v === "ALL" ? null : v === "prompt")
                        syncParam(
                          "isPromptPublic",
                          v === "ALL"
                            ? null
                            : v === "prompt"
                              ? "true"
                              : "false",
                        )
                      }}
                    >
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue
                          placeholder={t("プロンプト有無", "Prompt")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">
                          {t("プロンプト有無", "Prompt")}
                        </SelectItem>
                        <SelectItem value="prompt">
                          {t("あり", "Yes")}
                        </SelectItem>
                        <SelectItem value="no-prompt">
                          {t("なし", "No")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* sort */}
                    <Select
                      value={sortType ?? ""}
                      onValueChange={(v) => {
                        setSortType(v === "ALL" ? null : (v as any))
                        syncParam("sortType", v === "ALL" ? null : v)
                      }}
                    >
                      <SelectTrigger className="min-w-[120px]">
                        <ArrowDownWideNarrow />
                        <SelectValue placeholder={t("最新", "Latest")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DATE_CREATED">
                          {t("最新", "Latest")}
                        </SelectItem>
                        <SelectItem value="LIKES_COUNT">
                          {t("最も人気", "Most Liked")}
                        </SelectItem>
                        <SelectItem value="COMMENTS_COUNT">
                          {t("コメント数", "Most Comments")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* time range */}
                  <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
                    <Select
                      value={timeRange}
                      onValueChange={(v) => {
                        setTimeRange(v)
                        syncParam("timeRange", v === "ALL" ? null : v)
                      }}
                    >
                      <SelectTrigger className="w-full text-xs md:w-auto md:min-w-[120px] md:text-sm">
                        <SelectValue placeholder={t("全期間", "All time")} />
                      </SelectTrigger>
                      <SelectContent>
                        {["ALL", "TODAY", "YESTERDAY", "WEEK"].map((v) => (
                          <SelectItem key={v} value={v}>
                            {t(
                              v === "TODAY"
                                ? "本日"
                                : v === "YESTERDAY"
                                  ? "昨日"
                                  : v === "WEEK"
                                    ? "週間"
                                    : "全期間",
                              v === "ALL"
                                ? "All time"
                                : v === "TODAY"
                                  ? "Today"
                                  : v === "YESTERDAY"
                                    ? "Yesterday"
                                    : "Week",
                            )}
                          </SelectItem>
                        ))}
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
                          onClick={() => onChangeDialogMode(false)}
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
                          onClick={() => onChangeDialogMode(true)}
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
              </div>

              <Suspense fallback={<AppLoadingPage />}>
                {internalIsPagination ? (
                  <HomePaginationSensitiveWorksSection
                    page={newWorksPage}
                    setPage={setNewWorksPage}
                    workType={workType}
                    isPromptPublic={isPromptPublic}
                    sortType={sortType}
                    timeRange={timeRange}
                    isOneWorkPerUser={isOneWorkPerUser}
                    onSelect={isDialogMode ? openWork : undefined}
                    updateWorks={updateCurrentWorks}
                  />
                ) : (
                  <HomeSensitiveWorksSection
                    page={newWorksPage}
                    setPage={setPageWithParam(setNewWorksPage, "newPage")}
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

          {workView === "popular" && (
            <Suspense fallback={<AppLoadingPage />}>
              <HomeSensitiveHotWorksSection
                page={newWorksPage}
                setPage={setPageWithParam(setNewWorksPage, "newPage")}
                workType={workType}
                isPromptPublic={isPromptPublic}
                sortType={sortType}
              />
            </Suspense>
          )}

          {workView === "new-user" && (
            <>
              <div className="space-y-4">
                {/* 絞り込み用のセレクト群 - レスポンシブレイアウト */}
                <div className="space-y-3">
                  {/* フィルター行1: 種類、プロンプト、ソート */}
                  <div className="grid grid-cols-3 gap-2 md:flex md:space-x-4">
                    {/* type */}
                    <Select
                      value={workType ?? ""}
                      onValueChange={(v) => {
                        setWorkType(v === "ALL" ? null : (v as any))
                        syncParam("workType", v === "ALL" ? null : v)
                      }}
                    >
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue
                          placeholder={
                            workType
                              ? toWorkTypeText({ type: workType, lang: locale })
                              : t("種類", "Type")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {["ALL", "WORK", "VIDEO", "NOVEL", "COLUMN"].map(
                          (v) => (
                            <SelectItem key={v} value={v}>
                              {t(
                                v === "WORK"
                                  ? "画像"
                                  : v === "VIDEO"
                                    ? "動画"
                                    : v === "NOVEL"
                                      ? "小説"
                                      : v === "COLUMN"
                                        ? "コラム"
                                        : "種類",
                                v,
                              )}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

                    {/* prompt */}
                    <Select
                      value={
                        isPromptPublic === null
                          ? "ALL"
                          : isPromptPublic
                            ? "prompt"
                            : "no-prompt"
                      }
                      onValueChange={(v) => {
                        setIsPromptPublic(v === "ALL" ? null : v === "prompt")
                        syncParam(
                          "isPromptPublic",
                          v === "ALL"
                            ? null
                            : v === "prompt"
                              ? "true"
                              : "false",
                        )
                      }}
                    >
                      <SelectTrigger className="min-w-[120px]">
                        <SelectValue
                          placeholder={t("プロンプト有無", "Prompt")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">
                          {t("プロンプト有無", "Prompt")}
                        </SelectItem>
                        <SelectItem value="prompt">
                          {t("あり", "Yes")}
                        </SelectItem>
                        <SelectItem value="no-prompt">
                          {t("なし", "No")}
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* sort */}
                    <Select
                      value={sortType ?? ""}
                      onValueChange={(v) => {
                        setSortType(v === "ALL" ? null : (v as any))
                        syncParam("sortType", v === "ALL" ? null : v)
                      }}
                    >
                      <SelectTrigger className="min-w-[120px]">
                        <ArrowDownWideNarrow />
                        <SelectValue placeholder={t("最新", "Latest")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DATE_CREATED">
                          {t("最新", "Latest")}
                        </SelectItem>
                        <SelectItem value="LIKES_COUNT">
                          {t("最も人気", "Most Liked")}
                        </SelectItem>
                        <SelectItem value="COMMENTS_COUNT">
                          {t("コメント数", "Most Comments")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* time range */}
                  <div className="flex flex-col justify-end space-y-2 md:flex-row md:items-center md:space-y-0">
                    {/* 表示方式切り替え - よりスタイリッシュなデザイン */}
                    <div className="flex justify-end space-x-2 md:space-x-4">
                      <div className="flex justify-end rounded-lg bg-muted p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onChangeDialogMode(false)}
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
                          onClick={() => onChangeDialogMode(true)}
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
              </div>
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
                onClick={() => onChangeDialogMode(false)}
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
                onClick={() => onChangeDialogMode(true)}
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
                onClick={() => onChangeDialogMode(false)}
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
                onClick={() => onChangeDialogMode(true)}
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
            <FollowSensitiveTagsFeedContents
              page={followTagFeedPage}
              setPage={setPageWithParam(setFollowTagFeedPage, "followTagPage")}
              isPagination={internalIsPagination}
              onSelect={isDialogMode ? openWork : undefined}
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
    $categoryFirst: String!
    $categorySecond: String!
    $tagWorksLimit: Int!
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
      limit: 16
      where: {
        isSensitive: true,
      }
    ) {
      ...HomeTag
    }
    firstTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [R18],
        search: $categoryFirst
        orderBy: LIKES_COUNT
        isSensitive: true
        isNowCreatedAt: true
      }
    ) {
      ...HomeTagWork
    }
    secondTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [R18]
        search: $categorySecond
        orderBy: LIKES_COUNT
        isSensitive: true
        isNowCreatedAt: true
      }
    ) {
      ...HomeTagWork
    }
    newUserWorks: newUserWorks(
      offset: 0,
      limit: $newUsersWorksLimit,
      where: {
        ratings: [R18, R18G],
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
        ratings: [R18, R18G],
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
    HomeTagWorkFragment,
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
