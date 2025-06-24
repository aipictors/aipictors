import { loaderClient } from "~/lib/loader-client"
import { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { HomeBannerWorkFragment } from "~/routes/($lang)._main._index/components/home-banners"
import { HomeTagListItemFragment } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
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
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { getJstDate } from "~/utils/jst-date"
import { createMeta } from "~/utils/create-meta"
import { HomeNewUsersWorksFragment } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import { ArrowDownWideNarrow } from "lucide-react"
import { useState, Suspense } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import { CrossPlatformTooltip } from "~/components/cross-platform-tooltip"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { Separator } from "~/components/ui/separator"
import { Tabs, TabsContent } from "~/components/ui/tabs"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import { HomeSensitiveHotWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-hot-works-section"
import { HomeSensitiveWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-section"
import { HomeSensitiveWorksTagSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-tag-section"
import { HomeSensitiveNewUsersWorksSection } from "~/routes/($lang)._main._index/components/home-sensitive-new-users-works-section"
import { HomeSensitiveAwardWorkSection } from "~/routes/($lang)._main._index/components/home-sensitive-award-work-section"
import { HomeSensitiveTagsSection } from "~/routes/($lang)._main._index/components/home-sensitive-tags-section"
import { useQuery, useMutation } from "@apollo/client/index"
import { HomeAwardWorksSection } from "~/routes/($lang)._main._index/components/home-award-works"
import { HomeSensitiveTagList } from "~/routes/($lang).r._index/components/home-sensitive-tag-list"
import { HomeNewUsersSensitiveWorkListSection } from "~/routes/($lang).r._index/components/home-new-user-sensitive-work-list-section"
import { FollowSensitiveTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-tags-feed-contents"
import { FollowSensitiveUserFeedContents } from "~/routes/($lang)._main._index/components/follow-sensitive-user-feed-contents"
import { HomeSensitiveNewCommentsSection } from "~/routes/($lang)._main._index/components/home-sensitive-new-comments"
import { HomeNewSensitiveUsersSection } from "~/routes/($lang)._main._index/components/home-new-sensitive-users-section"
import { HomeSensitiveWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-users-recommended-section"
import { AppAnimatedTabs } from "~/components/app/app-animated-tabs"

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
      adWorksLimit: config.query.homeWorkCount.ad,
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
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            {/* left */}
            <div className="flex flex-col space-y-4 md:w-[56%] lg:w-[64%]">
              <HomeSensitiveTagList
                themeTitle={data.dailyTheme?.title}
                hotTags={data.hotTags}
              />
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
            <div className="flex w-full flex-col space-y-4">
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
              { v: "popular", label: t("人気", "Popular") },
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
              <div className="flex flex-wrap gap-4">
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
                    {["ALL", "WORK", "VIDEO", "NOVEL", "COLUMN"].map((v) => (
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
                    ))}
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
                      v === "ALL" ? null : v === "prompt" ? "true" : "false",
                    )
                  }}
                >
                  <SelectTrigger className="min-w-[120px]">
                    <SelectValue placeholder={t("プロンプト有無", "Prompt")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">
                      {t("プロンプト有無", "Prompt")}
                    </SelectItem>
                    <SelectItem value="prompt">{t("あり", "Yes")}</SelectItem>
                    <SelectItem value="no-prompt">{t("なし", "No")}</SelectItem>
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

                {/* time range */}
                <Select
                  value={timeRange}
                  onValueChange={(v) => {
                    setTimeRange(v)
                    syncParam("timeRange", v === "ALL" ? null : v)
                  }}
                >
                  <SelectTrigger className="min-w-[120px]">
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
              </div>

              <Suspense fallback={<AppLoadingPage />}>
                <HomeSensitiveWorksSection
                  page={newWorksPage}
                  setPage={setPageWithParam(setNewWorksPage, "newPage")}
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                  timeRange={timeRange}
                />
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
            <Suspense fallback={<AppLoadingPage />}>
              <HomeNewUsersSensitiveWorkListSection
                workType={workType}
                isPromptPublic={isPromptPublic}
                sortType={sortType}
              />
            </Suspense>
          )}
        </TabsContent>

        {/* ---------- FOLLOW USER ---------- */}
        <TabsContent value="follow-user">
          <Suspense fallback={<AppLoadingPage />}>
            <FollowSensitiveUserFeedContents
              page={followUserFeedPage}
              setPage={setPageWithParam(
                setFollowUserFeedPage,
                "followUserPage",
              )}
            />
          </Suspense>
        </TabsContent>

        {/* ---------- FOLLOW TAG ---------- */}
        <TabsContent value="follow-tag">
          <Suspense fallback={<AppLoadingPage />}>
            <FollowSensitiveTagsFeedContents
              page={followTagFeedPage}
              setPage={setPageWithParam(setFollowTagFeedPage, "followTagPage")}
            />
          </Suspense>
        </TabsContent>
      </Tabs>
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
    $adWorksLimit: Int!
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
    adWorks: works(
      offset: 0,
      limit: $adWorksLimit,
      where: {
        isFeatured: true,
        ratings: [R18],
        isNowCreatedAt: true
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
    HomeBannerWorkFragment,
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
