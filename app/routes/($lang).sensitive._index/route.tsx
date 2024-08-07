import { ConstructionAlert } from "~/components/construction-alert"
import { createClient } from "~/lib/client"
import {
  HomeAwardWorkSection,
  HomeWorkAwardFragment,
} from "~/routes/($lang)._main._index/components/home-award-work-section"
import {
  HomeColumnPostFragment,
  HomeColumnsSection,
} from "~/routes/($lang)._main._index/components/home-columns-section"
import {
  HomeNovelPostFragment,
  HomeNovelsSection,
} from "~/routes/($lang)._main._index/components/home-novels-section"
import {
  HomeTagFragment,
  HomeTagsSection,
} from "~/routes/($lang)._main._index/components/home-tags-section"
import { json, type MetaFunction, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"

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
  const client = createClient()

  const date = new Date()

  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  const now = new Date()

  const pastNovelDate = new Date(now)
  pastNovelDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastNovelDate.setDate(Math.floor(Math.random() * 28) + 1)

  const pastVideoDate = new Date(now)
  pastVideoDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastVideoDate.setDate(Math.floor(Math.random() * 28) + 1)

  const pastColumnDate = new Date(now)
  pastColumnDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastColumnDate.setDate(Math.floor(Math.random() * 28) + 1)

  const pastPromotionDate = new Date(now)
  pastPromotionDate.setMonth(now.getMonth() - Math.floor(Math.random() * 12))
  pastPromotionDate.setDate(Math.floor(Math.random() * 28) + 1)

  const resp = await client.query({
    query: query,
    variables: {
      awardDay: yesterday.getDate(),
      awardMonth: yesterday.getMonth() + 1,
      awardWorksLimit: config.query.homeWorkCount.award,
      awardYear: yesterday.getFullYear(),
      columnWorksBefore: pastColumnDate.toISOString(),
      columnWorksLimit: config.query.homeWorkCount.column,
      novelWorksBefore: pastNovelDate.toISOString(),
      novelWorksLimit: config.query.homeWorkCount.novel,
    },
  })

  const awardDateText = dateToText(yesterday)
  const novelWorksBeforeText = pastNovelDate.toISOString()
  const videoWorksBeforeText = pastVideoDate.toISOString()
  const columnWorksBeforeText = pastColumnDate.toISOString()
  const promotionWorksBeforeText = pastPromotionDate.toISOString()

  return json(
    {
      ...resp.data,
      awardDateText: awardDateText,
      novelWorksBeforeText,
      videoWorksBeforeText,
      columnWorksBeforeText,
      promotionWorksBeforeText,
    },
    { headers: { "Cache-Control": config.cacheControl.home } },
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
      <HomeAwardWorkSection
        awardDateText={data.awardDateText}
        title={"前日ランキング"}
        awards={data.workAwards}
        isSensitive={true}
      />
      <HomeTagsSection title={"人気タグ"} tags={data.recommendedTags} />
      <HomeNovelsSection
        dateText={data.novelWorksBeforeText}
        works={data.novelWorks}
        title={"小説"}
        isSensitive={true}
      />
      <HomeColumnsSection
        dateText={data.columnWorksBeforeText}
        works={data.columnWorks}
        title={"コラム"}
        isSensitive={true}
      />
    </>
  )
}

const query = graphql(
  `query HomeQuery(
    $awardDay: Int!
    $awardMonth: Int!
    $awardWorksLimit: Int!
    $awardYear: Int!
    $columnWorksBefore: String!
    $columnWorksLimit: Int!
    $novelWorksBefore: String!
    $novelWorksLimit: Int!
  ) {
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
      limit: 8
      where: {
        isSensitive: true
      }
    ) {
      ...HomeTag
    }
    novelWorks: works(
      offset: 0,
      limit: $novelWorksLimit,
      where: {
        ratings: [R18, R18G],
        workType: NOVEL,
        beforeCreatedAt: $novelWorksBefore
      }
    ) {
      ...HomeNovelPost
    }
    columnWorks: works(
      offset: 0,
      limit: $columnWorksLimit,
      where: {
        ratings: [R18, R18G],
        workType: COLUMN,
        beforeCreatedAt: $columnWorksBefore
      }
    ) {
      ...HomeColumnPost
    }
  }`,
  [
    HomeWorkAwardFragment,
    HomeTagFragment,
    HomeNovelPostFragment,
    HomeColumnPostFragment,
  ],
)
