import { createClient } from "~/lib/client"
import { HomeBannerWorkFragment } from "~/routes/($lang)._main._index/components/home-banners"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { Home2dContents } from "~/routes/($lang)._main.posts.2d/conponents/home-2d-contents"
import { getJstDate } from "~/utils/jst-date"
import { createMeta } from "~/utils/create-meta"

export const meta: MetaFunction = () => {
  return createMeta(META.HOME_2D)
}

const getUtcDateString = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = `0${date.getUTCMonth() + 1}`.slice(-2) // UTCの月を取得
  const day = `0${date.getUTCDate()}`.slice(-2) // UTCの日付を取得

  return `${year}/${month}/${day}`
}

export async function loader() {
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

  const client = createClient()

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

  const result = await client.query({
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

  return json(
    {
      ...result.data,
      awardDateText: awardDateText,
      generationDateText,
      firstTag: randomCategories[0],
      secondTag: randomCategories[1],
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
      <Home2dContents
        homeParticles={{
          firstTag: data.firstTag,
          firstTagWorks: data.firstTagWorks,
          secondTag: data.secondTag,
          secondTagWorks: data.secondTagWorks,
          promotionWorks: data.promotionWorks,
        }}
        isSensitive={true}
      />
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
        style: ILLUSTRATION
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
        style: ILLUSTRATION
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
        style: ILLUSTRATION
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
        style: ILLUSTRATION
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
