import { AppPage } from "@/_components/app/app-page"
import { ConstructionAlert } from "@/_components/construction-alert"
import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { partialRecommendedTagFieldsFragment } from "@/_graphql/fragments/partial-recommended-tag-fields"
import { createClient } from "@/_lib/client"
import { HomeAwardWorkSection } from "@/routes/($lang)._main._index/_components/home-award-work-section"
import { HomeTagsSection } from "@/routes/($lang)._main._index/_components/home-tags-section"
import { type MetaFunction, json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { HomeColumnsSection } from "@/routes/($lang)._main._index/_components/home-columns-section"
import { HomeNovelsSection } from "@/routes/($lang)._main._index/_components/home-novels-section"
import { HomeVideosSection } from "@/routes/($lang)._main._index/_components/home-videos-section"
import { workAwardFieldsFragment } from "@/_graphql/fragments/work-award-field"
import { HomeTagList } from "@/routes/($lang)._main._index/_components/home-tag-list"

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors | センシティブ"

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

export async function loader() {
  const client = createClient()

  const date = new Date()

  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  const resp = await client.query({
    query: query,
    variables: {
      awardDay: yesterday.getDate() - 1,
      awardMonth: yesterday.getMonth() + 1,
      awardYear: yesterday.getFullYear(),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
  })

  const awardDateText = [
    yesterday.getFullYear(),
    yesterday.getMonth() + 1,
    yesterday.getDate(),
  ].join("/")

  return json({
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
     * HomeWorksUsersRecommendedSection
     */
    // promotionWorks: resp.data.promotionWorks,
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

export default function SensitivePage() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <ConstructionAlert
        type="WARNING"
        message="不具合が起きる可能性があります。"
        fallbackURL="https://www.aipictors.com/"
        deadline={"2024-07-30"}
      />
      <div className="space-y-8">
        <HomeTagList
          themeTitle={data.dailyTheme?.title}
          hotTags={data.hotTags}
        />
        <HomeAwardWorkSection
          title={"前日ランキング"}
          works={data.workAwards}
          isSensitive={true}
        />
        <HomeTagsSection title={"人気タグ"} tags={data.tags} />
        {/* <HomeWorksUsersRecommendedSection
          isSensitive={true}
          works={data.promotionWorks}
        /> */}
        <HomeNovelsSection
          isSensitive={true}
          works={data.novelWorks}
          title={"小説"}
        />
        <HomeVideosSection
          isSensitive={true}
          works={data.videoWorks}
          title={"動画"}
        />
        <HomeColumnsSection
          isSensitive={true}
          works={data.columnWorks}
          title={"コラム"}
        />
      </div>
    </AppPage>
  )
}

const query = graphql(
  `query HomeQuery(
    $year: Int!
    $month: Int!
    $day: Int!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
  ) {
    novelWorks: works(
      offset: 0,
      limit: 16,
      where: {
        ratings: [R18, R18G],
        workType: NOVEL,
      }
    ) {
      ...PartialWorkFields
    }
    videoWorks: works(
      offset: 0,
      limit: 16,
      where: {
        ratings: [R18, R18G],
        workType: VIDEO,
      }
    ) {
      ...PartialWorkFields
    }
    columnWorks: works(
      offset: 0,
      limit: 16,
      where: {
        ratings: [R18, R18G],
        workType: COLUMN,
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
        isSensitive: true
      }
    ) {
      ...PartialRecommendedTagFields
    }
    # promotionWorks: works(
    #   offset: 0,
    #   limit: 80,
    #   where: {
    #     isRecommended: true
    #     ratings: [R18, R18G],
    #   }
    # ) {
    #   ...PartialWorkFields
    # }
    workAwards(
      offset: 0
      limit: 20
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
    partialTagFieldsFragment,
    partialWorkFieldsFragment,
    partialRecommendedTagFieldsFragment,
    workAwardFieldsFragment,
  ],
)
