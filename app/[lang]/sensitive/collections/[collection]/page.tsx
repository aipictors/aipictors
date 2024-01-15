import { CollectionArticle } from "@/app/[lang]/(main)/collections/[collection]/_components/collection-article"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { createClient } from "@/app/_contexts/client"
import { AppPage } from "@/components/app/app-page"
import { WorksQuery } from "@/graphql/__generated__/graphql"
import { worksQuery } from "@/graphql/queries/work/works"
import type { Metadata } from "next"

const SensitiveCollectionPage = async () => {
  const client = createClient()

  const worksResp = await client.query<WorksQuery>({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
    },
  })

  return (
    <AppPage>
      <CollectionArticle />
      <WorkList works={worksResp.data.works ?? []} />
    </AppPage>
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
