import type { Metadata } from "next"
import type { WorksQuery } from "__generated__/apollo"
import { WorksDocument } from "__generated__/apollo"
import { CollectionArticle } from "app/(main)/collections/[collection]/components/CollectionArticle"
import { WorkList } from "app/(main)/works/components/WorkList"
import { createClient } from "app/client"
import { MainPage } from "app/components/MainPage"

const CollectionPage = async () => {
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
      <CollectionArticle />
      <WorkList works={worksQuery.data.works ?? []} />
    </MainPage>
  )
}

export const metadata: Metadata = {
  robots: { index: false },
  title: "-",
}

export const revalidate = 60

export default CollectionPage
