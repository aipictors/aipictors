import type { Metadata } from "next"
import type { WorksQuery } from "__generated__/apollo"
import { WorksDocument } from "__generated__/apollo"
import { RelatedModelList } from "app/[lang]/(main)/tags/[tag]/components/RelatedModelList"
import { RelatedTagList } from "app/[lang]/(main)/tags/[tag]/components/RelatedTagList"
import { TagHeader } from "app/[lang]/(main)/tags/[tag]/components/TagHeader"
import { WorkList } from "app/[lang]/(main)/works/components/WorkList"
import { createClient } from "app/client"
import { MainPage } from "app/components/MainPage"

const TagPage = async () => {
  const client = createClient()

  const worksQuery = await client.query<WorksQuery>({
    query: WorksDocument,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  return (
    <MainPage>
      <RelatedTagList />
      <RelatedModelList />
      <TagHeader />
      <WorkList works={worksQuery.data.works ?? []} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default TagPage
