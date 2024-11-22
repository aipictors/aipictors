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
import { ConstructionAlert } from "~/components/construction-alert"
import { useState, useEffect, Suspense } from "react"
import { useTranslation } from "~/hooks/use-translation"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { ArrowDownWideNarrow } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
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
import { SensitiveChangeConfirmDialog } from "~/routes/($lang)._main._index/components/sensitive-change-confirm-dialog"

// カスタムフック: スクロール位置の保存・復元（windowオブジェクトを使用しない）
function useScrollRestoration(isMounted: boolean) {
  useEffect(() => {
    if (isMounted) {
      // スクロール位置の復元を行わない（React Routerが自動的に保持する場合）
    }
  }, [isMounted])
}

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME, undefined, props.params.lang)
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
  const categories = ["ゆめかわ", "ダークソウル", "パステル", "ちびキャラ"]

  const getRandomCategories = () => {
    const currentTime = new Date()

    // 1時間ごとに異なるシードを生成
    // const hourSeed = Math.floor(currentTime.getTime() / 3600000)
    const secondSeed = Math.floor(currentTime.getTime() / 1000)

    // 各カテゴリに対して異なる乱数を生成
    const seededRandom = (seed: number, str: string) => {
      const combined = seed + str.charCodeAt(0) // 簡単なハッシュ
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
    releaseList,
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  const t = useTranslation()

  const [searchParams, setSearchParams] = useSearchParams()

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

  const [currentTab, setCurrentTab] = useState(
    searchParams.get("tab") || "home",
  )

  useEffect(() => {
    const tab = searchParams.get("tab") || "home"
    setCurrentTab(tab)
  }, [searchParams])

  useEffect(() => {
    const newSearchParams = new URLSearchParams()

    newSearchParams.set("tab", currentTab)

    if (currentTab === "new") {
      newSearchParams.set("page", newWorksPage.toString())
    } else if (currentTab === "follow-user") {
      newSearchParams.set("page", followUserFeedPage.toString())
    } else if (currentTab === "follow-tag") {
      newSearchParams.set("page", followTagFeedPage.toString())
    } else {
      newSearchParams.delete("page")
    }

    // ページ全体のリロードを防ぐために navigate を使用
    updateQueryParams(newSearchParams)
  }, [
    currentTab,
    newWorksPage,
    followUserFeedPage,
    followTagFeedPage,
    updateQueryParams,
  ])

  // 初回レンダリング時にURLからページ番号を取得
  useEffect(() => {
    if (isMounted) {
      return
    }

    const page = searchParams.get("page")

    if (page) {
      const pageNumber = Number.parseInt(page)
      if (!Number.isNaN(pageNumber) && pageNumber >= 0 && pageNumber <= 100) {
        if (currentTab === "new") {
          setNewWorksPage(pageNumber)
        } else if (currentTab === "follow-user") {
          setFollowUserFeedPage(pageNumber)
        } else if (currentTab === "follow-tag") {
          setFollowTagFeedPage(pageNumber)
        }
      }
    }

    setIsMounted(true)
  }, [searchParams, isMounted, currentTab])

  const handleTabChange = (tab: string) => {
    // ページ番号をリセット
    setNewWorksPage(0)
    setFollowUserFeedPage(0)
    setFollowTagFeedPage(0)

    // 現在のタブを更新
    setCurrentTab(tab)

    // クエリパラメータを更新（navigate を使用してページ全体のリロードを防ぐ）
    const newSearchParams = new URLSearchParams()
    newSearchParams.set("tab", tab)
    setSearchParams(newSearchParams)
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

  // スクロール位置の復元を行わないようにカスタムフックを使用
  useScrollRestoration(isMounted)

  return (
    <>
      <ConstructionAlert
        type="WARNING"
        message="旧版はこちら"
        fallbackURL="https://legacy.aipictors.com"
      />
      {data.adWorks && data.adWorks.length > 0 && (
        <HomeBanners works={data.adWorks} />
      )}
      <Tabs
        value={currentTab}
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
                  "フォローしたユーザの新着作品が表示されます、現在はリニューアル版の投稿ページにて投稿された作品が表示されていますのでご注意ください",
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
          <div className="block space-y-4 md:flex md:space-x-4 md:space-y-0">
            <div className="flex flex-col space-y-4 md:w-[80%]">
              <HomeReleaseList releaseList={data.releaseList} />
              {data.dailyTheme && (
                <div>
                  <HomeTagList
                    themeTitle={data.dailyTheme.title}
                    hotTags={data.hotTags}
                  />
                </div>
              )}
              <HomeWorksTagSection
                tag={data.firstTag}
                works={data.firstTagWorks}
                secondTag={data.secondTag}
                secondWorks={data.secondTagWorks}
                isCropped={true}
              />
              <HomeWorksUsersRecommendedSection works={data.promotionWorks} />
              <HomeNewUsersWorksSection works={data.newUserWorks} />
              <HomeAwardWorkSection
                awardDateText={data.awardDateText}
                title={t("前日ランキング", "Previous Day Ranking")}
                awards={data.workAwards}
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
            <div className="flex w-full flex-col space-y-4">
              <div className="relative grid gap-4">
                <SensitiveChangeConfirmDialog />
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
            <Button
              variant={
                searchParams.get("view") === "new-user"
                  ? "default"
                  : "secondary"
              }
              onClick={() => handleWorkViewChange("new-user")}
            >
              <div className="flex space-x-2">
                <p>{t("新規ユーザ", "New Users")}</p>
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
                  <HomeWorksSection
                    page={newWorksPage}
                    setPage={setNewWorksPage}
                    workType={workType}
                    isPromptPublic={isPromptPublic}
                    sortType={sortType}
                  />
                </Suspense>
              </div>
            </div>
          )}
          {workView === "popular" && (
            <div className="space-y-4">
              {/* 人気作品の表示 */}
              <Suspense fallback={<AppLoadingPage />}>
                <HomeHotWorksSection
                  page={newWorksPage}
                  setPage={setNewWorksPage}
                  workType={workType}
                  isPromptPublic={isPromptPublic}
                  sortType={sortType}
                />
              </Suspense>
            </div>
          )}
          {workView === "new-user" && (
            <div className="space-y-4">
              {/* 新着ユーザ作品の表示 */}
              <Suspense fallback={<AppLoadingPage />}>
                <HomeNewUsersWorkListSection
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

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

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
        ratings: [G],
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
        ratings: [G]
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
