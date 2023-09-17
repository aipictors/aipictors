import { Metadata } from "next"
import {
  WorksQuery,
  WorksDocument,
  HotTagsQuery,
  HotTagsDocument,
} from "__generated__/apollo"
import { HomeTagList } from "app/(main)/components/HomeTagList"
import { HomeWorkList } from "app/(main)/components/HomeWorkList"
import { client } from "app/client"
import { MainLayout } from "app/components/MainLayout"

const Images3dPage = async () => {
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

export default Images3dPage
