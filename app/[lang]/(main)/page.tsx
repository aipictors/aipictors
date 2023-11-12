import { HomeTagList } from "@/app/[lang]/(main)/_components/home-tag-list"
import type { HotTagsQuery, WorksQuery } from "@/__generated__/apollo"
import { HotTagsDocument, WorksDocument } from "@/__generated__/apollo"

import { HomeWorkSection } from "@/app/[lang]/(main)/_components/home-work-section"

import { MainPage } from "@/app/_components/page/main-page"
import { createClient } from "@/app/_contexts/client"
import type { Metadata } from "next"

const HomePage = async () => {
  const client = createClient()

  // if (Config.isReleaseMode) {
  //   redirect(Config.currentWebSiteURL, RedirectType.replace)
  // }

  const worksQuery = await client.query<WorksQuery>({
    query: WorksDocument,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  const hotTagsQuery = await client.query<HotTagsQuery>({
    query: HotTagsDocument,
    variables: {},
  })

  return (
    <MainPage>
      <HomeTagList hotTags={hotTagsQuery.data} />
      <HomeWorkSection
        title="イラスト無料生成で参考にできる作品"
        works={worksQuery.data.works!}
      />
      <HomeWorkSection title="おすすめ作品" works={worksQuery.data.works!} />
      <HomeWorkSection title="推薦作品" works={worksQuery.data.works!} />
      <HomeWorkSection
        title="先日のランキング作品"
        works={worksQuery.data.works!}
      />
      <HomeWorkSection title="コレクション" works={worksQuery.data.works!} />
      <HomeWorkSection title="人気タグ" works={worksQuery.data.works!} />
      <HomeWorkSection title="ショート動画" works={worksQuery.data.works!} />
      <HomeWorkSection title="小説" works={worksQuery.data.works!} />
      <HomeWorkSection title="コラム" works={worksQuery.data.works!} />
      <HomeWorkSection
        title="＃タグのおすすめ作品"
        works={worksQuery.data.works!}
      />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default HomePage
