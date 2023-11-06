import type { WorksQuery } from "__generated__/apollo"
import { WorksDocument } from "__generated__/apollo"
import { RelatedModelList } from "app/[lang]/(main)/tags/[tag]/_components/RelatedModelList"
import { RelatedTagList } from "app/[lang]/(main)/tags/[tag]/_components/RelatedTagList"
import { TagHeader } from "app/[lang]/(main)/tags/[tag]/_components/TagHeader"
import { WorkList } from "app/[lang]/(main)/works/_components/WorkList"
import { MainPage } from "app/_components/page/MainPage"
import { createClient } from "app/_contexts/client"
import type { Metadata } from "next"

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
