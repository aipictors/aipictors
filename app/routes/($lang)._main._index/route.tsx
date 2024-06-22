import { AppPage } from "@/_components/app/app-page"
import { HeaderDevelopBanner } from "@/_components/header-develop-banner"
import { dailyThemeQuery } from "@/_graphql/queries/daily-theme/daily-theme"
import { hotTagsQuery } from "@/_graphql/queries/tag/hot-tags"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { HomeAwardWorkSection } from "@/routes/($lang)._main._index/_components/home-award-work-section"
import { HomeBanners } from "@/routes/($lang)._main._index/_components/home-banners"
import { HomeColumnsSection } from "@/routes/($lang)._main._index/_components/home-columns-section"
import { HomeNovelsSection } from "@/routes/($lang)._main._index/_components/home-novels-section"
import { HomeTagList } from "@/routes/($lang)._main._index/_components/home-tag-list"
import { HomeTagsSection } from "@/routes/($lang)._main._index/_components/home-tags-section"
import { HomeVideosSection } from "@/routes/($lang)._main._index/_components/home-videos-section"
import { HomeWorkDummies } from "@/routes/($lang)._main._index/_components/home-work-dummies"
import { HomeWorksGeneratedSection } from "@/routes/($lang)._main._index/_components/home-works-generated-section"
import { HomeWorksRecommendedSection } from "@/routes/($lang)._main._index/_components/home-works-recommended-section"
import { HomeWorksUsersRecommendedSection } from "@/routes/($lang)._main._index/_components/home-works-users-recommended-section"
import type { WorkTag } from "@/routes/($lang)._main._index/_types/work-tag"
import type { MetaFunction } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { Suspense } from "react"

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

  // おすすめ作品
  const suggestedWorkResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 80,
      where: {
        orderBy: "LIKES_COUNT",
        sort: "DESC",
        // 直近1週間の作品
        afterCreatedAt: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toDateString(),
        ratings: ["G"],
      },
    },
  })

  // 推薦作品
  /**
   * TODO_2024_07 クエリを統合する
   */
  const recommendedWorksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 54,
      where: {
        isRecommended: true,
        ratings: ["G"],
      },
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

  const date = new Date()
  const { data: themeResp } = await client.query({
    query: dailyThemeQuery,
    variables: {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // getMonth()は0から始まるので、1を足す
      day: date.getDate(), // getDate()は月の日にちを返す
      offset: 0,
      limit: 0,
    },
  })

  // コレクション
  const hotTagsResp = await client.query({
    query: hotTagsQuery,
    variables: {},
  })

  return json({
    suggestedWorkResp: suggestedWorkResp.data.works,
    recommendedWorks: recommendedWorksResp.data.works,
    themeResp: themeResp.dailyTheme,
    hotTags: hotTagsResp.data.hotTags,
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
      <HeaderDevelopBanner />
      <Suspense fallback={<HomeWorkDummies />}>
        <HomeBanners />
      </Suspense>
      {data && (
        <div className="space-y-8">
          <HomeTagList
            themeTitle={data.themeResp?.title}
            hotTags={data.hotTags}
          />
          <Suspense
            fallback={
              <>
                <HomeWorkDummies />
                <HomeWorkDummies />
              </>
            }
          >
            <HomeWorksGeneratedSection />
          </Suspense>
          <Suspense fallback={<HomeWorkDummies />}>
            <HomeAwardWorkSection title={"前日ランキング"} />
          </Suspense>
          <HomeTagsSection title={"人気タグ"} tags={data.tags} />
          <Suspense
            fallback={
              <>
                <HomeWorkDummies />
                <HomeWorkDummies />
                <HomeWorkDummies />
              </>
            }
          >
            <HomeWorksRecommendedSection />
          </Suspense>
          <Suspense
            fallback={
              <>
                <HomeWorkDummies />
                <HomeWorkDummies />
                <HomeWorkDummies />
              </>
            }
          >
            <HomeWorksUsersRecommendedSection />
          </Suspense>
          <Suspense
            fallback={
              <>
                <HomeWorkDummies />
                <HomeWorkDummies />
              </>
            }
          >
            <HomeNovelsSection title={"小説"} />
          </Suspense>
          <Suspense
            fallback={
              <>
                <HomeWorkDummies />
                <HomeWorkDummies />
              </>
            }
          >
            <HomeVideosSection title={"動画"} />
          </Suspense>
          <Suspense
            fallback={
              <>
                <HomeWorkDummies />
                <HomeWorkDummies />
              </>
            }
          >
            <HomeColumnsSection title={"コラム"} />
          </Suspense>
        </div>
      )}
    </AppPage>
  )
}
