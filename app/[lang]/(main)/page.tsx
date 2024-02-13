import { HomeTagList } from "@/app/[lang]/(main)/_components/home-tag-list"
import { HomeWorkSection } from "@/app/[lang]/(main)/_components/home-work-section"
import MainPageLoading from "@/app/[lang]/(main)/loading"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import { hotTagsQuery } from "@/graphql/queries/tag/hot-tags"
import { worksQuery } from "@/graphql/queries/work/works"
import type { Metadata } from "next"
import { Suspense } from "react"

const HomePage = async () => {
  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })

  const hotTagsResp = await client.query({
    query: hotTagsQuery,
    variables: {},
  })

  const sections = [
    {
      title: "イラスト無料生成で参考にできる作品",
      tooltip: "イラスト無料生成で参考にできる作品です。",
    },
    { title: "おすすめ作品" },
    { title: "推薦作品" },
    { title: "コレクション" },
    { title: "人気タグ" },
    { title: "ショート動画" },
    { title: "小説" },
    { title: "コラム" },
  ]

  return (
    <AppPage className="space-y-4">
      <HomeTagList hotTags={hotTagsResp.data.hotTags} />
      <p className="fw-bold">開発中のページですので内容は仮のものです。</p>
      {sections.map((section) => (
        <HomeWorkSection
          key={section.title}
          title={section.title}
          tooltip={section.tooltip}
          works={worksResp.data.works!}
        />
      ))}
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
