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
import {
  HomeNewCommentsFragment,
  HomeNewCommentsSection,
} from "~/routes/($lang)._main._index/components/home-new-comments"
import {
  HomeNewPostedUsersFragment,
  HomeNewUsersSection,
} from "~/routes/($lang)._main._index/components/home-new-users-section"
import { ArrowDownWideNarrow } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { FollowTagsFeedContents } from "~/routes/($lang)._main._index/components/follow-tags-feed-contents"
import { FollowUserFeedContents } from "~/routes/($lang)._main._index/components/follow-user-feed-contents"
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

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME_SENSITIVE, undefined, props.params.lang)
}

const getUtcDateString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2) // UTCの月を取得
  const day = `0${date.getUTCDate()}`.slice(-2) // UTCの日付を取得

  return `${year}/${month}/${day}`
}

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  // 下記カテゴリからランダムに2つ選んで返す
  const categories = ["縄", "中だし"]

  const getRandomCategories = () => {
    const currentTime = new Date()

    // 1時間ごとに異なるシードを生成
    const hourSeed = Math.floor(currentTime.getTime() / 3600000)

    // シードを使った乱数生成器
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000
      return x - Math.floor(x)
    }

    const randomCategories = categories
      .sort(() => seededRandom(hourSeed) - 0.5)
      .slice(0, 2)

    return randomCategories
  }

  const randomCategories = getRandomCategories()

  const now = getJstDate()

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const pastNovelDate = new Date(now)
  pastNovelDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastNovelDate.setDate(Math.floor(Math.random() * 28) + 1)
  if (pastNovelDate > now) {
    pastNovelDate.setTime(now.getTime())
  }

  const pastVideoDate = new Date(now)
  pastVideoDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastVideoDate.setDate(Math.floor(Math.random() * 28) + 1)
  if (pastVideoDate > now) {
    pastVideoDate.setTime(now.getTime())
  }

  const pastColumnDate = new Date(now)
  pastColumnDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastColumnDate.setDate(Math.floor(Math.random() * 28) + 1)
  if (pastColumnDate > now) {
    pastColumnDate.setTime(now.getTime())
  }

  const pastPromotionDate = new Date(now)
  pastPromotionDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastPromotionDate.setDate(Math.floor(Math.random() * 28) + 1)
  if (pastPromotionDate > now) {
    pastPromotionDate.setTime(now.getTime())
  }

  const pastGenerationDate = new Date(now)
  pastGenerationDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastGenerationDate.setDate(Math.floor(Math.random() * 28) + 1)
  if (pastGenerationDate > now) {
    pastGenerationDate.setTime(now.getTime())
  }

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
      // novelWorksLimit: config.query.homeWorkCount.novel,
      // columnWorksLimit: config.query.homeWorkCount.column,
      // generationWorksLimit: config.query.homeWorkCount.generation,
      promotionWorksLimit: config.query.homeWorkCount.promotion,
      awardWorksLimit: config.query.homeWorkCount.award,
      // pastGenerationBefore: pastGenerationDate.toISOString(),
      // novelWorksBefore: pastNovelDate.toISOString(),
      // columnWorksBefore: pastColumnDate.toISOString(),
      categoryFirst: randomCategories[0],
      categorySecond: randomCategories[1],
      tagWorksLimit: config.query.homeWorkCount.tag,
      newUsersWorksLimit: config.query.homeWorkCount.newUser,
    },
  })

  const awardDateText = getUtcDateString(yesterday)

  const generationDateText = pastGenerationDate.toISOString()

  const novelWorksBeforeText = pastNovelDate.toISOString()

  const videoWorksBeforeText = pastVideoDate.toISOString()

  const columnWorksBeforeText = pastColumnDate.toISOString()

  return {
    ...result.data,
    awardDateText: awardDateText,
    generationDateText,
    novelWorksBeforeText,
    videoWorksBeforeText,
    columnWorksBeforeText,
    firstTag: randomCategories[0],
    secondTag: randomCategories[1],
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

const useUpdateQueryParams = () => {
  const updateQueryParams = (newParams: URLSearchParams) => {
    const newUrl = `${window.location.pathname}?${newParams.toString()}`
    window.history.replaceState(null, "", newUrl)
  }
  return updateQueryParams
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const [searchParams] = useSearchParams()

  const updateQueryParams = useUpdateQueryParams()

  const [isMounted, setIsMounted] = useState(false)

  const [newWorksPage, setNewWorksPage] = useState(0)

  const [followUserFeedPage, setFollowUserFeedPage] = useState(0)

  const [followTagFeedPage, setFollowTagFeedPage] = useState(0)

  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(null)

  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(null)

  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(null)

  const location = useLocale()

  useEffect(() => {
    if (isMounted) {
      return
    }

    if (!searchParams.toString() || searchParams.get("tab") === "home") {
      return
    }

    const page = searchParams.get("page")
    if (page) {
      const pageNumber = Number.parseInt(page)
      if (Number.isNaN(pageNumber) || pageNumber < 1 || pageNumber > 100) {
      } else {
        setNewWorksPage(pageNumber)
      }
    } else {
      setNewWorksPage(0)
    }

    const type = searchParams.get("workType")
    if (type) setWorkType(type as IntrospectionEnum<"WorkType">)

    const prompt = searchParams.get("isPromptPublic")
    if (prompt)
      setIsPromptPublic(
        prompt === "true" ? true : prompt === "false" ? false : null,
      )

    const sort = searchParams.get("sortType")
    if (sort) setSortType(sort as IntrospectionEnum<"WorkOrderBy">)

    setIsMounted(true)
  }, [searchParams])

  // newWorksPageが変更されたときにURLパラメータを更新
  useEffect(() => {
    if (!searchParams.toString() || searchParams.get("tab") === "home") {
      return
    }

    if (newWorksPage >= 0) {
      searchParams.set("page", newWorksPage.toString())
      updateQueryParams(searchParams)
    }
  }, [newWorksPage, searchParams, updateQueryParams])

  const handleTabChange = (tab: string) => {
    searchParams.set("tab", tab)
    updateQueryParams(searchParams)
  }

  const handleWorkTypeChange = (value: string) => {
    if (value === "ALL") {
      searchParams.delete("workType")
      setWorkType(null)
    } else {
      searchParams.set("workType", value)
      setWorkType(value as IntrospectionEnum<"WorkType">)
    }

    // ページ番号を0にリセット
    setNewWorksPage(0)
    searchParams.set("page", "0")
    updateQueryParams(searchParams)
  }

  const handlePromptChange = (value: string) => {
    if (value === "ALL") {
      searchParams.delete("isPromptPublic")
      setIsPromptPublic(null)
    } else {
      const isPrompt = value === "prompt"

      searchParams.set("isPromptPublic", isPrompt ? "true" : "false")
      setIsPromptPublic(isPrompt)
    }
    updateQueryParams(searchParams)
  }

  const handleSortTypeChange = (value: string) => {
    if (value === "ALL") {
      searchParams.delete("sortType")
      setSortType(null)
    } else {
      searchParams.set("sortType", value)
      setSortType(value as IntrospectionEnum<"WorkOrderBy">)
    }
    updateQueryParams(searchParams)
  }

  const [workView, setWorkView] = useState(searchParams.get("view") || "new")

  const handleWorkViewChange = (view: string) => {
    setWorkView(view)
    searchParams.set("view", view)
    updateQueryParams(searchParams)
  }

  const navigate = useNavigate()
  const { data: pass } = useQuery(viewerCurrentPassQuery, {})

  const { data: advertisements } = useQuery(randomCustomerAdvertisementQuery, {
    variables: {
      where: {
        isSensitive: true,
        page: "work",
      },
    },
  })

  const [updateClickedCountCustomerAdvertisement] = useMutation(
    updateClickedCountCustomerAdvertisementMutation,
  )

  const onClickAdvertisement = async () => {
    if (advertisements?.randomCustomerAdvertisement) {
      // Update advertisement click count
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

  if (!data) {
    return null
  }

  return (
    <>
      <Tabs
        defaultValue={searchParams.get("tab") || "home"}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="home">{t("ホーム", "Home")}</TabsTrigger>
          <TabsTrigger value="new">
            <p className="hidden md:block">
              {t("新着・人気", "New & Popular")}
            </p>
            <p className="block md:hidden">{t("新着", "New")}</p>
          </TabsTrigger>
          <TabsTrigger value="follow-user">
            <div className="flex items-center space-x-2">
              <p className="hidden md:block">
                {t("フォロー新着", "Followed Users")}
              </p>
              <p className="block md:hidden">{t("フォロー", "Followed")}</p>
              <CrossPlatformTooltip
                text={t(
                  "フォローしたユーザの新着作品が表示されます",
                  "Displays works from followed users",
                )}
              />
            </div>
          </TabsTrigger>
          <TabsTrigger value="follow-tag">
            <div className="flex items-center space-x-2">
              <p className="hidden md:block">
                {t("お気に入りタグ新着", "Favorite Tags")}
              </p>
              <p className="block md:hidden">{t("タグ", "Tags")}</p>
              <CrossPlatformTooltip
                text={t(
                  "お気に入り登録したタグの新着作品が表示されます",
                  "Displays works from favorite tags",
                )}
              />
            </div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="m-0 flex flex-col space-y-4">
          {data && (
            <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
              <div className="flex flex-col space-y-4 md:w-[80%]">
                <div>
                  <HomeSensitiveTagList
                    themeTitle={data.dailyTheme?.title}
                    hotTags={data.hotTags}
                  />
                </div>
                <HomeSensitiveWorksTagSection
                  tag={data.firstTag}
                  works={data.firstTagWorks}
                  secondTag={data.secondTag}
                  secondWorks={data.secondTagWorks}
                  isCropped={true}
                />
                <HomeSensitiveNewUsersWorksSection works={data.newUserWorks} />
                <HomeSensitiveAwardWorkSection
                  awardDateText={data.awardDateText}
                  title={t("前日ランキング", "Previous Day Ranking")}
                  awards={data.workAwards}
                />
                <HomeSensitiveTagsSection
                  title={t("人気タグ", "Popular Tags")}
                  tags={data.recommendedTags}
                />
              </div>
              <Separator
                orientation="vertical"
                className="hidden h-[100vh] w-[1px] md:block"
              />
              <div className="flex w-full flex-col space-y-4">
                <div className="relative grid gap-4">
                  <Button
                    onClick={() => {
                      navigate("/")
                    }}
                    variant={"secondary"}
                    className="flex w-full transform cursor-pointer items-center"
                  >
                    <p className="text-sm">{t("全年齢", "All Ages")}</p>
                  </Button>
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
                              advertisements.randomCustomerAdvertisement
                                .imageUrl
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
          )}
        </TabsContent>
        <TabsContent value="new" className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <Button
              variant={workView === "new" ? "default" : "secondary"}
              onClick={() => handleWorkViewChange("new")}
            >
              {t("新着", "New")}
            </Button>
            <Button
              variant={
                searchParams.get("view") === "popular" ? "default" : "secondary"
              }
              onClick={() => handleWorkViewChange("popular")}
            >
              <div className="flex space-x-2">
                <p>{t("人気", "Popular")}</p>
                <CrossPlatformTooltip
                  text={t(
                    "最近投稿された人気作品が表示されます",
                    "Recently popular works",
                  )}
                />
              </div>
            </Button>
          </div>
          {workView === "new" ? (
            <div className="space-y-4">
              {/* 新着作品の表示 */}
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Select
                    value={workType ? workType : ""}
                    onValueChange={handleWorkTypeChange}
                  >
                    <SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isPromptPublic === null
                            ? t("プロンプト有無", "Prompt")
                            : isPromptPublic
                              ? t("あり", "Yes")
                              : t("なし", "No")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">
                        {t("プロンプト有無", "Prompt")}
                      </SelectItem>
                      <SelectItem value="prompt">{t("あり", "Yes")}</SelectItem>
                      <SelectItem value="no-prompt">
                        {t("なし", "No")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={sortType ? sortType : ""}
                    onValueChange={handleSortTypeChange}
                  >
                    <SelectTrigger>
                      <ArrowDownWideNarrow />
                      <SelectValue
                        placeholder={sortType ? sortType : t("最新", "Latest")}
                      />
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
                <Suspense fallback={<AppLoadingPage />}>
                  <HomeSensitiveWorksSection
                    page={newWorksPage}
                    setPage={setNewWorksPage}
                    workType={workType}
                    isPromptPublic={isPromptPublic}
                    sortType={sortType}
                  />
                </Suspense>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 人気作品の表示 */}
              <Suspense fallback={<AppLoadingPage />}>
                <HomeSensitiveHotWorksSection
                  page={newWorksPage}
                  setPage={setNewWorksPage}
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                />
              </Suspense>
            </div>
          )}
        </TabsContent>

        <TabsContent value="follow-user">
          <Suspense fallback={<AppLoadingPage />}>
            <FollowUserFeedContents
              page={followUserFeedPage}
              setPage={setFollowUserFeedPage}
            />
          </Suspense>
        </TabsContent>
        <TabsContent value="follow-tag">
          <Suspense fallback={<AppLoadingPage />}>
            <FollowTagsFeedContents
              page={followTagFeedPage}
              setPage={setFollowTagFeedPage}
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
