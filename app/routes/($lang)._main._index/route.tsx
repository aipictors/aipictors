import { ConstructionAlert } from "~/components/construction-alert"
import { createClient } from "~/lib/client"
import { HomeWorkAwardFragment } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { HomeBannerWorkFragment } from "~/routes/($lang)._main._index/components/home-banners"
import { HomeTagListItemFragment } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagFragment } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomePromotionWorkFragment } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"
import { HomeTagWorkFragment } from "~/routes/($lang)._main._index/components/home-works-tag-section"
import { HomeContents } from "~/routes/($lang)._main._index/components/home-contents"

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors | AIイラスト投稿・生成サイト"

  const metaDescription =
    "AIで作った画像を公開してみよう！AIイラスト・生成サイト「AIピクターズ」、AIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: metaDescription },
    { name: "robots", content: "noindex" },
    { name: "twitter:title", content: metaTitle },
    { name: "twitter:description", content: metaDescription },
    { name: "twitter:image", content: metaImage },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:title", content: metaTitle },
    { property: "og:description", content: metaDescription },
    { property: "og:image", content: metaImage },
    { property: "og:site_name", content: metaTitle },
  ]
}

export const dateToText = (date: Date) => {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/")
}

export async function loader() {
  // 下記カテゴリからランダムに2つ選んで返す
  const categories = ["メスガキ", "ダークファンタジー", "ゆめかわ", "イケメン"]

  const randomCategories = categories
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)

  const client = createClient()

  const date = new Date()

  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  const now = new Date()

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

  console.log(randomCategories)

  const result = await client.query({
    query: query,
    variables: {
      awardDay: yesterday.getDate(),
      awardMonth: yesterday.getMonth() + 1,
      awardYear: yesterday.getFullYear(),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
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
    },
  })

  const awardDateText = dateToText(yesterday)
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
        message="不具合が起きる可能性があります。"
        fallbackURL="https://www.aipictors.com/"
        deadline={"2024-07-30"}
      />
      <HomeContents
        dailyThemeTitle={data.dailyTheme?.title}
        hotTags={data.hotTags}
        firstTag={data.firstTag}
        secondTag={data.secondTag}
        firstTagWorks={data.firstTagWorks}
        secondTagWorks={data.secondTagWorks}
        awardDateText={data.awardDateText}
        workAwards={data.workAwards}
        recommendedTags={data.recommendedTags}
        promotionWorks={data.promotionWorks}
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
  ) {
    adWorks: works(
      offset: 0,
      limit: $adWorksLimit,
      where: {
        isFeatured: true,
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
      limit: 8
      where: {
        isSensitive: false
      }
    ) {
      ...HomeTag
    }
    firstTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [G],
        search: $categoryFirst
        orderBy: VIEWS_COUNT
      }
    ) {
      ...HomeTagWork
    }
    secondTagWorks: works(
      offset: 0,
      limit: $tagWorksLimit,
      where: {
        ratings: [G],
        search: $categorySecond
        orderBy: VIEWS_COUNT
      }
    ) {
      ...HomeTagWork
    }
    promotionWorks: works(
      offset: 0,
      limit: $promotionWorksLimit,
      where: {
        isRecommended: true
        ratings: [G]
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
  ],
)
