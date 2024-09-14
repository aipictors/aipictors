import { createClient } from "~/lib/client"
import { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeBanners,
  HomeBannerWorkFragment,
} from "~/routes/($lang)._main._index/components/home-banners"
import { HomeTagListItemFragment } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomeContents } from "~/routes/($lang)._main._index/components/home-contents"
import { getJstDate } from "~/utils/jst-date"
import { createMeta } from "~/utils/create-meta"
import { HomeNewUsersWorksFragment } from "~/routes/($lang)._main._index/components/home-new-users-works-section"
import { createClient as createCmsClient } from "microcms-js-sdk"
import type { MicroCmsApiReleaseResponse } from "~/types/micro-cms-release-response"
import { HomeNewPostedUsersFragment } from "~/routes/($lang)._main._index/components/home-new-users-section"
import { HomeNewCommentsFragment } from "~/routes/($lang)._main._index/components/home-new-comments"
import { ConstructionAlert } from "~/components/construction-alert"
import { redirectUrlWithOptionalSensitiveParam } from "~/utils/redirect-url-with-optional-sensitive-param"

export const meta: MetaFunction = () => {
  return createMeta(META.HOME)
}

const getUtcDateString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2) // UTCの月を取得
  const day = `0${date.getUTCDate()}`.slice(-2) // UTCの日付を取得

  return `${year}/${month}/${day}`
}

export async function loader({ request }: { request: Request }) {
  const redirectResult = redirectUrlWithOptionalSensitiveParam(
    request,
    "/sensitive",
  )
  if (redirectResult) {
    return redirectResult
  }

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

  const client = createClient()

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
    apiKey: "P0QqFga5C1pPv3MDnSgMSYeFFLvAG1e5hNXt",
  })

  const releaseList: MicroCmsApiReleaseResponse = await microCmsClient.get({
    endpoint: `releases?orders=-createdAt&limit=${4}&offset=0`,
  })

  const result = await client.query({
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

  return json(
    {
      ...result.data,
      awardDateText: awardDateText,
      generationDateText,
      novelWorksBeforeText,
      videoWorksBeforeText,
      columnWorksBeforeText,
      firstTag: randomCategories[0],
      secondTag: randomCategories[1],
      releaseList,
    },
    {
      headers: {
        "Cache-Control": config.cacheControl.home,
      },
    },
  )
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <ConstructionAlert
        type="WARNING"
        message="リニューアル版はすべて開発中のため不具合が起きる可能性があります！一部機能を新しくリリースし直しています！基本的には旧版をそのままご利用ください！"
        fallbackURL="https://www.aipictors.com"
      />
      {data.adWorks && data.adWorks.length > 0 && (
        <HomeBanners works={data.adWorks} />
      )}
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
          releaseList: data.releaseList,
          newPostedUsers: data.newPostedUsers,
          newComments: data.newComments,
        }}
        isCropped={true}
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
