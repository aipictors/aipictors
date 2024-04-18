import { HomeTagList } from "@/[lang]/(main)/_components/home-tag-list"
import { HomeWorkSection } from "@/[lang]/(main)/_components/home-work-section"
import { AppDevelopmentPage } from "@/_components/app/app-development-page"
import { AppPage } from "@/_components/app/app-page"
import { Button } from "@/_components/ui/button"
import { hotTagsQuery } from "@/_graphql/queries/tag/hot-tags"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { config } from "@/config"
import type { MetaFunction } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { toast } from "sonner"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix! Using Vite and Cloudflare!",
    },
  ]
}

export async function loader() {
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

  return {
    works: worksResp.data.works,
    hotTags: hotTagsResp.data.hotTags,
  }
}

export default function Index() {
  const data = useLoaderData<typeof loader>()

  if (!config.isDevelopmentMode) {
    return <AppDevelopmentPage />
  }

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
      <HomeTagList hotTags={data.hotTags} />
      <p className="fw-bold">開発中のページですので内容は仮のものです。</p>
      {sections.map((section) => (
        <HomeWorkSection
          key={section.title}
          title={section.title}
          tooltip={section.tooltip}
          works={data.works!}
        />
      ))}
    </AppPage>
  )
}
