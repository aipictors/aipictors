import type { WorksQuery } from "__generated__/apollo"
import { WorksDocument } from "__generated__/apollo"
import { CollectionArticle } from "app/[lang]/(main)/collections/[collection]/_components/CollectionArticle"
import { WorkList } from "app/[lang]/(main)/works/_components/WorkList"
import { MainPage } from "app/_components/MainPage"
import { createClient } from "app/_utils/client"
import type { Metadata } from "next"

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
