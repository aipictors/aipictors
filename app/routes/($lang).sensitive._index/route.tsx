import { AppPage } from "@/_components/app/app-page"
import { ConstructionAlert } from "@/_components/construction-alert"
import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { partialRecommendedTagFieldsFragment } from "@/_graphql/fragments/partial-recommended-tag-fields"
import { createClient } from "@/_lib/client"
import { HomeAwardWorkSection } from "@/routes/($lang)._main._index/_components/home-award-work-section"
import { HomeTagsSection } from "@/routes/($lang)._main._index/_components/home-tags-section"
import { HomeWorksUsersRecommendedSection } from "@/routes/($lang)._main._index/_components/home-works-users-recommended-section"
import { type MetaFunction, json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

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
      after: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString(),
      awardDay: yesterday.getDate() - 1,
      awardMonth: yesterday.getMonth() + 1,
      awardYear: yesterday.getFullYear(),
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
  })

  console.log(resp.data.recommendedTags)

  const awardDateText = [
    yesterday.getFullYear(),
    yesterday.getMonth() + 1,
    yesterday.getDate(),
  ].join("/")

  return json({
    awardDateText: awardDateText,
    hotTags: resp.data.hotTags,
    promotionWorks: resp.data.promotionWorks,
    tags: resp.data.recommendedTags,
    workAwards: resp.data.workAwards,
  })
}

export default function SensitivePage() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage className="space-y-6">
      <ConstructionAlert
        type="WARNING"
        fallbackURL="https://www.aipictors.com/"
        message={"このページは開発中です"}
      />
      <HomeAwardWorkSection
        title={"前日ランキング"}
        // awardDateText={data.awardDateText}
        // works={data.workAwards.map((award) => award.work)}
      />
      <HomeTagsSection title={"人気タグ"} tags={data.tags} />
      {/* <HomeWorksRecommendedSection /> */}
      <HomeWorksUsersRecommendedSection
      // works={data.promotionWorks}
      />
      {/* <HomeNovelsSection title={"小説"} /> */}
      {/* <HomeVideosSection title={"動画"} /> */}
      {/* <HomeColumnsSection title={"コラム"} /> */}
    </AppPage>
  )
}

const query = graphql(
  `query HomeQuery(
    $after: String!
    $awardYear: Int!
    $awardMonth: Int!
    $awardDay: Int!
  ) {
    works: works(
      offset: 0,
      limit: 80,
      where: {
        orderBy: LIKES_COUNT,
        sort: DESC,
        createdAtAfter: $after,
        ratings: [R15, R18, R18G]
      },
    ) {
      ...PartialWorkFields
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
    promotionWorks: works(
      offset: 0,
      limit: 80,
      where: {
        isRecommended: true
        ratings: [R15, R18, R18G]
      }
    ) {
      ...PartialWorkFields
    }
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
      id
      index
      dateText
      work {
        ...PartialWorkFields
      }
    }
  }`,
  [
    partialTagFieldsFragment,
    partialWorkFieldsFragment,
    partialRecommendedTagFieldsFragment,
  ],
)
