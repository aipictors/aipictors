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
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomeContents } from "~/routes/($lang)._main._index/components/home-contents"
import { getJstDate } from "~/utils/jst-date"
import { createMeta } from "~/utils/create-meta"
import { HomeNewUsersWorksFragment } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"

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

export default function Index() {
  const data = useLoaderData<typeof loader>()

  if (!data) {
    return null
  }

  return (
    <>
      <HomeContents
        homeParticles={{
          dailyThemeTitle: data.dailyTheme ? (data.dailyTheme.title ?? "") : "",
          hotTags: data.hotTags,
          firstTag: data.firstTag,
          firstTagWorks: data.firstTagWorks,
          secondTag: data.secondTag,
          secondTagWorks: data.secondTagWorks,
          awardDateText: data.awardDateText,
          workAwards: data.workAwards,
          recommendedTags: data.recommendedTags,
          promotionWorks: data.promotionWorks,
          newUserWorks: data.newUserWorks,
          newPostedUsers: data.newPostedUsers,
          newComments: data.newComments,
        }}
        isCropped={false}
      />
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
        orderBy: VIEWS_COUNT
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
        orderBy: VIEWS_COUNT
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
