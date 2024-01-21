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

  // if (Config.isReleaseMode) {
  //   redirect(Config.currentWebSiteURL, RedirectType.replace)
  // }

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

  return (
    <AppPage className="space-y-4">
      <Suspense fallback={<MainPageLoading />}>
        <HomeTagList hotTags={hotTagsResp.data.hotTags} />
        <HomeWorkSection
          title={"イラスト無料生成で参考にできる作品"}
          works={worksResp.data.works!}
          tooltip={"イラスト無料生成で参考にできる作品です。"}
        />
        <HomeWorkSection title={"おすすめ作品"} works={worksResp.data.works!} />
        <HomeWorkSection title={"推薦作品"} works={worksResp.data.works!} />
        <HomeWorkSection
          title="先日のランキング作品"
          works={worksResp.data.works!}
        />
        <HomeWorkSection title={"コレクション"} works={worksResp.data.works!} />
        <HomeWorkSection title={"人気タグ"} works={worksResp.data.works!} />
        <HomeWorkSection title={"ショート動画"} works={worksResp.data.works!} />
        <HomeWorkSection title={"小説"} works={worksResp.data.works!} />
        <HomeWorkSection title={"コラム"} works={worksResp.data.works!} />
        <HomeWorkSection
          title={"＃タグのおすすめ作品"}
          works={worksResp.data.works!}
        />
      </Suspense>
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
