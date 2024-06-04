import { AppPage } from "@/_components/app/app-page"
import { hotTagsQuery } from "@/_graphql/queries/tag/hot-tags"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { HomeBanners } from "@/routes/($lang)._main._index/_components/home-banners"
import { HomeTagList } from "@/routes/($lang)._main._index/_components/home-tag-list"
import { HomeTagsSection } from "@/routes/($lang)._main._index/_components/home-tags-section"
import { HomeWorkSection } from "@/routes/($lang)._main._index/_components/home-work-section"
import type { WorkTag } from "@/routes/($lang)._main._index/_types/work-tag"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
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

  // 生成作品
  const generationWorkResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 8,
      where: {
        isFeatured: true,
      },
    },
  })

  // おすすめ作品
  const suggestedWorkResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })

  // Fetch data from the given URL and parse it to the TagData type
  const tags = await fetch(
    "https://www.aipictors.com/wp-content/themes/AISite/json/hashtag/hashtag-image-0.json",
  )
    .then((res) => res.json())
    .then((data: unknown) => {
      // Assuming the data is an array of arrays, convert it to an array of TagData
      return (data as [string, string][]).map(
        ([name, thumbnailUrl]): WorkTag => ({
          name,
          thumbnailUrl,
        }),
      )
    })

  // biome-ignore lint/complexity/noForEach: <explanation>
  tags.forEach((tag) => {
    tag.thumbnailUrl = `https://www.aipictors.com/wp-content/uploads/${tag.thumbnailUrl}`
  })

  // タグからランダムに8つ取得
  const randomTags = tags.sort(() => Math.random() - 0.5).slice(0, 8)

  // 推薦作品
  const recommendedWorksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        isRecommended: true,
      },
    },
  })

  // コレクション
  const hotTagsResp = await client.query({
    query: hotTagsQuery,
    variables: {},
  })

  return {
    generationWorkResp: generationWorkResp.data.works,
    suggestedWorkResp: suggestedWorkResp.data.works,
    recommendedWorks: recommendedWorksResp.data.works,
    hotTags: hotTagsResp.data.hotTags,
    tags: randomTags,
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  const sections = [
    // {
    //   title: "無料生成できる作品",
    //   tooltip: "無料画像生成で参考にできる作品です。",
    //   works: data.generationWorkResp,
    // },
    { title: "おすすめ", works: data.suggestedWorkResp, tooltip: "" },
    { title: "ユーザからの推薦", works: data.recommendedWorks, tooltip: "" },
    // { title: "コレクション", works: data.suggestedWorkResp },
    // { title: "人気タグ", works: data.suggestedWorkResp },
    // { title: "ショート動画", works: data.suggestedWorkResp },
    // { title: "小説", works: data.suggestedWorkResp },
    // { title: "コラム", works: data.suggestedWorkResp },
  ]

  return (
    <AppPage className="space-y-4">
      <HomeBanners />
      <Suspense>
        <HomeTagList hotTags={data.hotTags} />
      </Suspense>
      {sections.map((section) => (
        <HomeWorkSection
          key={section.title}
          title={section.title}
          tooltip={section.tooltip ? section.tooltip : undefined}
          works={section.works}
        />
      ))}
      <HomeTagsSection title={"人気タグ"} tags={data.tags} />
    </AppPage>
  )
}
