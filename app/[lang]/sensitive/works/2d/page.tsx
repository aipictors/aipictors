import type { HotTagsQuery, WorksQuery } from "@/__generated__/apollo"
import { HotTagsDocument, WorksDocument } from "@/__generated__/apollo"
import { HomeTagList } from "@/app/[lang]/(main)/_components/home-tag-list"
import { HomeWorkList } from "@/app/[lang]/(main)/_components/home-work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import type { Metadata } from "next"

const SensitiveWorks2dPage = async () => {
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
    <AppPage>
      <HomeTagList hotTags={hotTagsQuery.data.hotTags} />
      <HomeWorkList works={worksQuery.data.works} />
    </AppPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default SensitiveWorks2dPage
