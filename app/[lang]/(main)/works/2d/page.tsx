import { HomeTagList } from "@/app/[lang]/(main)/_components/home-tag-list"
import { HomeWorkList } from "@/app/[lang]/(main)/_components/home-work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { HotTagsQuery, WorksQuery } from "@/graphql/__generated__/graphql"
import { hotTagsQuery } from "@/graphql/queries/tag/hot-tags"
import { worksQuery } from "@/graphql/queries/work/works"
import type { Metadata } from "next"

/**
 * イラストの作品一覧画面
 */
const Works2dPage = async () => {
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

export default Works2dPage
