import { AppPage } from "~/components/app/app-page"
import { ConstructionAlert } from "~/components/construction-alert"
import { partialTagFieldsFragment } from "~/graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import { HomeAwardWorkSection } from "~/routes/($lang)._main._index/components/home-award-work-section"
import { HomeBanners } from "~/routes/($lang)._main._index/components/home-banners"
import { HomeColumnsSection } from "~/routes/($lang)._main._index/components/home-columns-section"
import { homeGenerationBannerWorkFieldFragment } from "~/routes/($lang)._main._index/components/home-generation-banner"
import { HomeNovelsSection } from "~/routes/($lang)._main._index/components/home-novels-section"
import { HomeTagList } from "~/routes/($lang)._main._index/components/home-tag-list"
import { HomeTagsSection } from "~/routes/($lang)._main._index/components/home-tags-section"
import { HomeVideosSection } from "~/routes/($lang)._main._index/components/home-videos-section"
import { HomeWorksGeneratedSection } from "~/routes/($lang)._main._index/components/home-works-generated-section"
import { HomeWorksUsersRecommendedSection } from "~/routes/($lang)._main._index/components/home-works-users-recommended-section"
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

export async function loader({ response }: LoaderFunctionArgs) {
  const client = createClient()

  const date = new Date()

  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  const resp = await client.query({
    query: query,
    variables: {
      after: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString(),
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
    },
  })

  const awardDateText = [
    yesterday.getFullYear(),
    yesterday.getMonth() + 1,
    yesterday.getDate(),
  ].join("/")

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
     * HomeTagList
     */
    hotTags: resp.data.hotTags,
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
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <ConstructionAlert
        type="WARNING"
        message="不具合が起きる可能性があります。"
        fallbackURL="https://www.aipictors.com/"
        deadline={"2024-07-30"}
      />
      <HomeBanners adWorks={data.adWorks} />
      <HomeTagList themeTitle={data.dailyTheme?.title} hotTags={data.hotTags} />

      <HomeWorksGeneratedSection works={data.generationWorks} />
      <HomeAwardWorkSection
        awardDateText={data.awardDateText}
        title={"前日ランキング"}
        works={data.workAwards}
      />
      <HomeTagsSection title={"人気タグ"} tags={data.tags} />
      <HomeWorksUsersRecommendedSection works={data.promotionWorks} />
      <HomeNovelsSection works={data.novelWorks} title={"小説"} />
      <HomeVideosSection works={data.videoWorks} title={"動画"} />
      <HomeColumnsSection works={data.columnWorks} title={"コラム"} />
    </AppPage>
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
    $videoWorksLimit: Int!
    $columnWorksLimit: Int!
    $generationWorksLimit: Int!
    $promotionWorksLimit: Int!
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
      ...HomeGenerationBannerWorkField
    }
    novelWorks: works(
      offset: 0,
      limit: $novelWorksLimit,
      where: {
        ratings: [G, R15],
        workType: NOVEL,
      }
    ) {
      ...PartialWorkFields
    }
    videoWorks: works(
      offset: 0,
      limit: $videoWorksLimit,
      where: {
        ratings: [G, R15],
        workType: VIDEO,
      }
    ) {
      ...PartialWorkFields
    }
    columnWorks: works(
      offset: 0,
      limit: $columnWorksLimit,
      where: {
        ratings: [G, R15],
        workType: COLUMN,
      }
    ) {
      ...PartialWorkFields
    }
    generationWorks: works(
      offset: 0
      limit: $generationWorksLimit
      where: {
        orderBy: LIKES_COUNT
        sort: DESC
        ratings: [G]
        isFeatured: true
        createdAtAfter: $after
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
    hotTags {
      ...PartialTagFields
      firstWork {
        ...PartialWorkFields
      }
    }
    recommendedTags: recommendedTags(
      limit: 8
      where: {
        isSensitive: false
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
        isSensitive: false
      }
    ) {
      ...WorkAwardFields
    }
  }`,
  [
    partialTagFieldsFragment,
    partialWorkFieldsFragment,
    homeGenerationBannerWorkFieldFragment,
    partialRecommendedTagFieldsFragment,
    workAwardFieldsFragment,
  ],
)
