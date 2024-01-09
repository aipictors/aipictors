import { WorksDocument, WorksQuery } from "@/__generated__/apollo"
import { CollectionArticle } from "@/app/[lang]/(main)/collections/[collection]/_components/collection-article"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { MainPage } from "@/app/_components/page/main-page"
import { createClient } from "@/app/_contexts/client"
import type { Metadata } from "next"

const SensitiveCollectionPage = async () => {
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

export const generateStaticParams = () => {
  return []
}

export const revalidate = 60

export default SensitiveCollectionPage
