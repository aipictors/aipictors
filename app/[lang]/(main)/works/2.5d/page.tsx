import type { HotTagsQuery, WorksQuery } from "__generated__/apollo"
import { HotTagsDocument, WorksDocument } from "__generated__/apollo"
import { HomeTagList } from "app/[lang]/(main)/_components/HomeTagList"
import { HomeWorkList } from "app/[lang]/(main)/_components/HomeWorkList"
import { MainPage } from "app/_components/pages/MainPage"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

const Works25dPage = async () => {
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

export default Works25dPage
