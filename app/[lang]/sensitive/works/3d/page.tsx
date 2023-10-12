import type { Metadata } from "next"
import type { WorksQuery, HotTagsQuery } from "__generated__/apollo"
import { WorksDocument, HotTagsDocument } from "__generated__/apollo"
import { HomeTagList } from "app/[lang]/(main)/components/HomeTagList"
import { HomeWorkList } from "app/[lang]/(main)/components/HomeWorkList"
import { createClient } from "app/client"
import { MainPage } from "app/components/MainPage"

const Works3dPage = async () => {
  const client = createClient()

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
      <HomeTagList hotTagsQuery={hotTagsQuery.data} />
      <HomeWorkList worksQuery={worksQuery.data} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default Works3dPage
