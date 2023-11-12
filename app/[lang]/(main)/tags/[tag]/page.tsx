import type { WorksQuery } from "__generated__/apollo"
import { WorksDocument } from "__generated__/apollo"
import { RelatedModelList } from "app/[lang]/(main)/tags/[tag]/_components/related-model-list"
import { RelatedTagList } from "app/[lang]/(main)/tags/[tag]/_components/related-tag-list"
import { TagHeader } from "app/[lang]/(main)/tags/[tag]/_components/tag-header"
import { WorkList } from "app/[lang]/(main)/works/_components/work-list"
import { MainPage } from "app/_components/page/main-page"
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
