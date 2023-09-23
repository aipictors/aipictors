import type { Metadata } from "next"
import type { WorksQuery, HotTagsQuery } from "__generated__/apollo"
import { WorksDocument, HotTagsDocument } from "__generated__/apollo"
import { HomeTagList } from "app/(main)/components/HomeTagList"
import { HomeWorkList } from "app/(main)/components/HomeWorkList"
import { client } from "app/client"
import { MainLayout } from "app/components/MainLayout"

const Works25dPage = async () => {
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
    <MainLayout>
      <HomeTagList hotTagsQuery={hotTagsQuery.data} />
      <HomeWorkList worksQuery={worksQuery.data} />
    </MainLayout>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default Works25dPage
