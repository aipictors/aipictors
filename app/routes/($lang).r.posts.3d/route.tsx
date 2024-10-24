import { loaderClient } from "~/lib/loader-client"
import { HomeBannerWorkFragment } from "~/routes/($lang)._main._index/components/home-banners"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { getJstDate } from "~/utils/jst-date"
import { createMeta } from "~/utils/create-meta"
import { useQuery } from "@apollo/client/index"
import { ArrowDownWideNarrow } from "lucide-react"
import { useState, useEffect, useContext, Suspense } from "react"
import { AppLoadingPage } from "~/components/app/app-loading-page"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs"
import { AuthContext } from "~/contexts/auth-context"
import { useLocale } from "~/hooks/use-locale"
import { useTranslation } from "~/hooks/use-translation"
import { useUpdateQueryParams } from "~/hooks/use-update-query-params"
import { HomeRecommendedWorkList } from "~/routes/($lang)._main._index/components/home-recommended-work-list"
import { HomeWorksSection } from "~/routes/($lang)._main._index/components/home-works-section"
import { toWorkTypeText } from "~/utils/work/to-work-type-text"
import type { IntrospectionEnum } from "~/lib/introspection-enum"
import { HomeSensitiveWorksTagSection } from "~/routes/($lang)._main._index/components/home-sensitive-works-tag-section"

export const meta: MetaFunction = (props) => {
  return createMeta(META.HOME_3D, undefined, props.params.lang)
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
  const categories = ["おっぱい", "JK"]

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
      adWorksLimit: config.query.homeWorkCount.ad,
      promotionWorksLimit: config.query.homeWorkCount.promotion,
      categoryFirst: randomCategories[0],
      categorySecond: randomCategories[1],
      tagWorksLimit: config.query.homeWorkCount.tag,
    },
  })

  const awardDateText = getUtcDateString(yesterday)
  const generationDateText = pastGenerationDate.toISOString()

  return {
    ...result.data,
    awardDateText: awardDateText,
    generationDateText,
    firstTag: randomCategories[0],
    secondTag: randomCategories[1],
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

export default function Index() {
  const data = useLoaderData<typeof loader>()

  const t = useTranslation()

  const [searchParams] = useSearchParams()

  const updateQueryParams = useUpdateQueryParams()

  const [isMounted, setIsMounted] = useState(false)

  const [newWorksPage, setNewWorksPage] = useState(0)

  const [workType, setWorkType] =
    useState<IntrospectionEnum<"WorkType"> | null>(null)

  const [isPromptPublic, setIsPromptPublic] = useState<boolean | null>(null)

  const [sortType, setSortType] =
    useState<IntrospectionEnum<"WorkOrderBy"> | null>(null)

  useEffect(() => {
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

  const appContext = useContext(AuthContext)

  // 推薦作品
  const { data: recommendedWorksResp } = useQuery(WorksQuery, {
    skip: appContext.isLoading,
    variables: {
      offset: 0,
      limit: config.query.homeWorkCount.promotion,
      where: {
        isRecommended: true,
        ratings: ["G", "R15"],
        style: "REAL",
        isNowCreatedAt: true,
      },
    },
  })

  const workDisplayed = recommendedWorksResp?.works ?? data?.promotionWorks

  const location = useLocale()

  if (data === null) {
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
            {t("3D作品一覧", "3D Works List")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="home" className="m-0 flex flex-col space-y-4">
          {data && (
            <>
              <HomeSensitiveWorksTagSection
                tag={data.firstTag}
                works={data.firstTagWorks}
                secondTag={data.secondTag}
                secondWorks={data.secondTagWorks}
                style="REAL"
              />
              {workDisplayed !== undefined && workDisplayed?.length > 0 && (
                <HomeRecommendedWorkList
                  title={t("ユーザからの推薦", "Recommended by users")}
                  works={workDisplayed}
                  isCropped={false}
                  link={
                    "https://www.aipictors.com/search/?query=%7B%22keyword%22%3A%22%23%23%E6%8E%A8%E8%96%A6%E4%BD%9C%E5%93%81%22%2C%22options%22%3A%7B%22age%22%3A%5B%220%22%2C%223%22%2C%221%22%2C%222%22%5D%2C%22posttype%22%3A%5B%22image%22%2C%22novel%22%2C%22column%22%2C%22video%22%5D%2C%22target%22%3A%5B%22category%22%2C%22title%22%2C%22explanation%22%2C%22prompt%22%2C%22owner%22%5D%2C%22service%22%3A%22%22%2C%22model%22%3A%22%22%2C%22prompt%22%3A%5B%220%22%2C%221%22%2C%222%22%5D%2C%22follow%22%3A%5B%220%22%2C%221%22%5D%2C%22subject%22%3A%5B%220%22%2C%221%22%5D%2C%22taste%22%3A%5B%221%22%2C%222%22%2C%223%22%5D%2C%22post-since%22%3A%22%22%2C%22post-until%22%3A%22%22%2C%22collabid%22%3A%22%22%2C%22order%22%3A%22new%22%2C%22limit%22%3A%22100%22%2C%22offset%22%3A0%7D%7D&next=1"
                  }
                  isShowProfile={true}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="new">
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
                  <SelectItem value="VIDEO">{t("動画", "Video")}</SelectItem>
                  <SelectItem value="NOVEL">{t("小説", "Novel")}</SelectItem>
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
                  <SelectItem value="no-prompt">{t("なし", "No")}</SelectItem>
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
                    {t("コメント数", "Most Commented")}
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
                style="REAL"
              />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}

const query = graphql(
  `query HomeQuery(
    # $pastGenerationBefore: String!
    $adWorksLimit: Int!
    # $novelWorksLimit: Int!
    # $novelWorksBefore: String!
    # $columnWorksLimit: Int!
    # $columnWorksBefore: String!
    # $generationWorksLimit: Int!
    $promotionWorksLimit: Int!
    $categoryFirst: String!
    $categorySecond: String!
    $tagWorksLimit: Int!
  ) {
    adWorks: works(
      offset: 0,
      limit: $adWorksLimit,
      where: {
        isFeatured: true,
        ratings: [R18, R18G],
        style: REAL
      }
    ) {
      ...HomeBannerWork
    }
    firstTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [R18, R18G],
        search: $categoryFirst
        orderBy: LIKES_COUNT
        style: REAL
      }
    ) {
      ...HomeTagWork
    }
    secondTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [R18, R18G],
        search: $categorySecond
        orderBy: LIKES_COUNT
        style: REAL
      }
    ) {
      ...HomeTagWork
    }
    promotionWorks: works(
      offset: 0,
      limit: $promotionWorksLimit,
      where: {
        isRecommended: true
        ratings: [R18, R18G]
        style: REAL
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
  [HomeBannerWorkFragment, HomePromotionWorkFragment, HomeTagWorkFragment],
)

const WorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...HomePromotionWork
    }
  }`,
  [HomePromotionWorkFragment],
)
