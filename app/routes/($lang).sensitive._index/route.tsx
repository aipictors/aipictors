import { ConstructionAlert } from "~/components/construction-alert"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import { HomeAwardWorkSection } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { HomeBanners } from "~/routes/($lang)._main._index/components/home-banners"
import { HomeColumnsSection } from "~/routes/($lang)._main._index/components/home-columns-section"
import { HomeGenerationBannerWorkFragment } from "~/routes/($lang)._main._index/components/home-generation-banner"
import { HomeNovelsSection } from "~/routes/($lang)._main._index/components/home-novels-section"
import { HomeTagsSection } from "~/routes/($lang)._main._index/components/home-tags-section"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { partialRecommendedTagFieldsFragment } from "~/graphql/fragments/partial-recommended-tag-fields"
import { workAwardFieldsFragment } from "~/graphql/fragments/work-award-field"
import { config } from "~/config"

export const WORK_COUNT_DEFINE = {
  AD_WORKS: 16,
  NOVEL_WORKS: 16,
  VIDEO_WORKS: 16,
  COLUMN_WORKS: 16,
  GENERATION_WORKS: 16,
  PROMOTION_WORKS: 16,
  AWARD_WORKS: 16,
}

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

export async function loader({ response }: LoaderFunctionArgs) {
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
      after: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toDateString(),
      awardDay: yesterday.getDate(),
      awardMonth: yesterday.getMonth() + 1,
      awardYear: yesterday.getFullYear(),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      adWorksLimit: WORK_COUNT_DEFINE.AD_WORKS,
      novelWorksLimit: WORK_COUNT_DEFINE.NOVEL_WORKS,
      videoWorksLimit: WORK_COUNT_DEFINE.VIDEO_WORKS,
      columnWorksLimit: WORK_COUNT_DEFINE.COLUMN_WORKS,
      generationWorksLimit: WORK_COUNT_DEFINE.GENERATION_WORKS,
      promotionWorksLimit: WORK_COUNT_DEFINE.PROMOTION_WORKS,
      awardWorksLimit: WORK_COUNT_DEFINE.AWARD_WORKS,
      novelWorksBefore: pastNovelDate.toISOString(),
      videoWorksBefore: pastVideoDate.toISOString(),
      columnWorksBefore: pastColumnDate.toISOString(),
      promotionWorksBefore: pastPromotionDate.toISOString(),
    },
  })

  const awardDateText = dateToText(yesterday)
  const novelWorksBeforeText = pastNovelDate.toISOString()
  const videoWorksBeforeText = pastVideoDate.toISOString()
  const columnWorksBeforeText = pastColumnDate.toISOString()
  const promotionWorksBeforeText = pastPromotionDate.toISOString()

  response?.headers.append("Cache-Control", config.cacheControl.home)

  return json({
    /**
     * HomeBanners
     */
    adWorks: resp.data.adWorks,
    /**
     * HomeTagList
     */
    dailyTheme: resp.data.dailyTheme,
    /**
     * HomeAwardWorkSection
     */
    awardDateText: awardDateText,
    /**
     * HomeAwardWorkSection
     */
    workAwards: resp.data.workAwards,
    /**
     * HomeWorksGeneratedSection
     */
    generationWorks: resp.data.generationWorks,

    /**
     * HomeWorksUsersRecommendedSection
     */
    promotionWorks: resp.data.promotionWorks,
    /**
     * HomeTagsSection
     */
    tags: resp.data.recommendedTags,
    /**
     * HomeNovelsSection
     */
    novelWorks: resp.data.novelWorks,
    /**
     * HomeVideosSection
     */
    videoWorks: resp.data.videoWorks,
    /**
     * HomeColumnsSection
     */
    columnWorks: resp.data.columnWorks,
    /**
     * novelWorksBeforeText
     */
    novelWorksBeforeText,
    /**
     * videoWorksBeforeText
     */
    videoWorksBeforeText,
    /**
     * columnWorksBeforeText
     */
    columnWorksBeforeText,
    /**
     * promotionWorksBeforeText
     */
    promotionWorksBeforeText,
  })
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
      <HomeBanners works={data.adWorks} />
      <HomeAwardWorkSection
        awardDateText={data.awardDateText}
        title={"前日ランキング"}
        works={data.workAwards}
        isSensitive={true}
      />
      <HomeTagsSection title={"人気タグ"} tags={data.tags} />
      <HomeNovelsSection
        dateText={data.novelWorksBeforeText}
        works={data.novelWorks}
        title={"小説"}
        isSensitive={true}
      />
      {/* <HomeVideosSection
        dateText={data.videoWorksBeforeText}
        works={data.videoWorks}
        title={"動画"}
        isSensitive={true}
      /> */}
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
    $after: String!
    $year: Int!
    $month: Int!
    $day: Int!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
    $adWorksLimit: Int!
    $novelWorksLimit: Int!
    $novelWorksBefore: String!
    $videoWorksLimit: Int!
    $videoWorksBefore: String!
    $columnWorksLimit: Int!
    $columnWorksBefore: String!
    $generationWorksLimit: Int!
    $promotionWorksLimit: Int!
    $promotionWorksBefore: String!
    $awardWorksLimit: Int!
  ) {
    adWorks: works(
      offset: 0,
      limit: $adWorksLimit,
      where: {
        isFeatured: true,
        ratings: [G],
      }
    ) {
      ...HomeGenerationBannerWork
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
      ...PartialWorkFields
    }
    videoWorks: works(
      offset: 0,
      limit: $videoWorksLimit,
      where: {
        ratings: [R18, R18G],
        workType: VIDEO,
        beforeCreatedAt: $videoWorksBefore
      }
    ) {
      ...PartialWorkFields
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
      ...PartialWorkFields
    }
    generationWorks: works(
      offset: 0
      limit: $generationWorksLimit
      where: {
        orderBy: DATE_CREATED,
        sort: DESC
        ratings: [R18, R18G]
        isFeatured: true
        beforeCreatedAt: $after
      }
    ) {
      ...PartialWorkFields
    }
    dailyTheme(
      year: $year
      month: $month
      day: $day
    ) {
      id
      title
      dateText
      year
      month
      day
      worksCount,
      works(offset: 0, limit: 0) {
        ...PartialWorkFields
      }
    }
    recommendedTags: recommendedTags(
      limit: 8
      where: {
        isSensitive: true
      }
    ) {
      ...PartialRecommendedTagFields
    }
    promotionWorks: works(
      offset: 0,
      limit: $promotionWorksLimit,
      where: {
        isRecommended: true
        ratings: [G]
        beforeCreatedAt: $promotionWorksBefore
      }
    ) {
      ...PartialWorkFields
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
      ...WorkAwardFields
    }
  }`,
  [
    partialWorkFieldsFragment,
    HomeGenerationBannerWorkFragment,
    partialRecommendedTagFieldsFragment,
    workAwardFieldsFragment,
  ],
)
