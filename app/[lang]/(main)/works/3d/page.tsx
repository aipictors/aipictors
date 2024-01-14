import { HomeTagList } from "@/app/[lang]/(main)/_components/home-tag-list"
import { HomeWorkList } from "@/app/[lang]/(main)/_components/home-work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { HotTagsQuery, WorksQuery } from "@/graphql/__generated__/graphql"
import { hotTagsQuery } from "@/graphql/queries/tag/hot-tags"
import { worksQuery } from "@/graphql/queries/work/works"
import type { Metadata } from "next"

/**
 * リアルテイストの作品一覧画面
 */
const Works3dPage = async () => {
  const client = createClient()

  const worksResp = await client.query<WorksQuery>({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  const hotTagsResp = await client.query<HotTagsQuery>({
    query: hotTagsQuery,
    variables: {},
  })

  return (
    <AppPage>
      <HomeTagList hotTags={hotTagsResp.data.hotTags} />
      <HomeWorkList works={worksResp.data.works} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default Works3dPage
