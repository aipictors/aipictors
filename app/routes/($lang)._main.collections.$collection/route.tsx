import { CollectionArticle } from "@/[lang]/(main)/collections/[collection]/_components/collection-article"
import { WorkList } from "@/[lang]/(main)/works/_components/work-list"
import { AppPage } from "@/_components/app/app-page"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { useLoaderData } from "@remix-run/react"
import { useParams } from "@remix-run/react"

/**
 * コレクションの詳細
 * @returns
 */
export async function loader() {
  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })
  return {
    worksResp,
  }
}

export default function Collections() {
  const params = useParams()

  if (params.collection === undefined) {
    throw new Error()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <CollectionArticle />
      <WorkList works={data.worksResp.data.works ?? []} />
    </AppPage>
  )
}
