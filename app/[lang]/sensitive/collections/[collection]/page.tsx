import { CollectionArticle } from "@/app/[lang]/(main)/collections/[collection]/_components/collection-article"
import { WorkList } from "@/app/[lang]/(main)/works/_components/work-list"
import { AppPage } from "@/components/app/app-page"
import { worksQuery } from "@/graphql/queries/work/works"
import { createClient } from "@/lib/client"
import type { Metadata } from "next"

const SensitiveCollectionPage = async () => {
  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
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
