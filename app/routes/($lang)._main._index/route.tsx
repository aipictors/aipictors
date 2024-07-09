import { AppPage } from "@/_components/app/app-page"
import { ConstructionAlert } from "@/_components/construction-alert"
import { partialTagFieldsFragment } from "@/_graphql/fragments/partial-tag-fields"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { createClient } from "@/_lib/client"
import { HomeAwardWorkSection } from "@/routes/($lang)._main._index/_components/home-award-work-section"
import { HomeBanners } from "@/routes/($lang)._main._index/_components/home-banners"
import { HomeColumnsSection } from "@/routes/($lang)._main._index/_components/home-columns-section"
import { HomeNovelsSection } from "@/routes/($lang)._main._index/_components/home-novels-section"
import { HomeTagList } from "@/routes/($lang)._main._index/_components/home-tag-list"
import { HomeTagsSection } from "@/routes/($lang)._main._index/_components/home-tags-section"
import { HomeVideosSection } from "@/routes/($lang)._main._index/_components/home-videos-section"
import { HomeWorksGeneratedSection } from "@/routes/($lang)._main._index/_components/home-works-generated-section"
import { HomeWorksRecommendedSection } from "@/routes/($lang)._main._index/_components/home-works-recommended-section"
import { HomeWorksUsersRecommendedSection } from "@/routes/($lang)._main._index/_components/home-works-users-recommended-section"
import type { WorkTag } from "@/routes/($lang)._main._index/_types/work-tag"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export const meta: MetaFunction = () => {
  const metaTitle = "Aipictors | AIイラスト投稿・生成サイト"

  const metaDescription =
    "AIで作った画像を公開してみよう！AIイラスト・生成サイト「AIピクターズ」、AIイラスト・AIフォト・AIグラビア・AI小説投稿サイトです。"

  const metaImage =
    "https://pub-c8b482e79e9f4e7ab4fc35d3eb5ecda8.r2.dev/aipictors-ogp.jpg"

  return [
    { title: metaTitle },
    { name: "description", content: "noindex" },
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

  const homeQueryResp = await client.query({
    query: query,
    variables: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      after: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString(),
    },
  })

  // おすすめタグ一覧
  // タグからランダムに8つ取得
  const tags = await fetch(
    "https://www.aipictors.com/wp-content/themes/AISite/json/hashtag/hashtag-image-0.json",
  )
    .then((res) => res.json())
    .then((data: unknown) => {
      return (data as [string, string][]).map(
        ([name, thumbnailUrl]): WorkTag => ({
          name,
          thumbnailUrl,
        }),
      )
    })

  for (const tag of tags) {
    tag.thumbnailUrl = `https://www.aipictors.com/wp-content/uploads/${tag.thumbnailUrl}`
  }

  const randomTags = tags.sort(() => Math.random() - 0.5).slice(0, 24)

  const adWorks = homeQueryResp.data.adWorks

  return json({
    adWorks: adWorks,
    suggestedWorkResp: homeQueryResp.data.works,
    imageGenerationWorks: homeQueryResp.data.imageGenerationWorks,
    themeResp: homeQueryResp.data.dailyTheme,
    hotTags: homeQueryResp.data.hotTags,
    tags: randomTags,
  })
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  /**
   * TODO_2024_07 Suspenseを減らす
   */
  return (
    <AppPage>
      <ConstructionAlert
        type="WARNING"
        title="このページは現在開発中です。不具合が起きる可能性があります。"
        fallbackURL="https://www.aipictors.com/"
        date={"2024-07-30"}
      />
      <HomeBanners adWorks={data.adWorks} />
      {data && (
        <div className="space-y-8">
          <HomeTagList
            themeTitle={data.themeResp?.title}
            hotTags={data.hotTags}
          />
          <HomeWorksGeneratedSection />
          <HomeAwardWorkSection title={"前日ランキング"} />
          <HomeTagsSection title={"人気タグ"} tags={data.tags} />
          <HomeWorksRecommendedSection />
          <HomeWorksUsersRecommendedSection />
          <HomeNovelsSection title={"小説"} />
          <HomeVideosSection title={"動画"} />
          <HomeColumnsSection title={"コラム"} />
        </div>
      )}
    </AppPage>
  )
}

export const query = graphql(
  `query HomeQuery(
    $after: String
    $year: Int
    $month: Int
    $day: Int
  ) {
    adWorks: works(
      offset: 0,
      limit: 54,
      where: {
        isFeatured: true,
        ratings: [G],
      }
    ) {
      ...PartialWorkFields
    }
    works: works(
      offset: 0,
      limit: 80,
      where: {
        orderBy: LIKES_COUNT,
        sort: DESC,
        createdAtAfter: $after,
        ratings: [G],
      },
    ) {
      ...PartialWorkFields
    }
    imageGenerationWorks: works(
      offset: 0,
      limit: 54,
      where: {
        isRecommended: true,
        ratings: [G],
      },
    ) {
      ...PartialWorkFields
    }
    dailyTheme(year: $year, month: $month, day: $day) {
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
  }`,
  [partialTagFieldsFragment, partialWorkFieldsFragment],
)
