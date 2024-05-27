import { AppPage } from "@/_components/app/app-page"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { CollectionArticle } from "@/routes/($lang)._main.collections.$collection/_components/collection-article"
import { WorkList } from "@/routes/($lang)._main.works._index/_components/work-list"
import { json, useLoaderData } from "@remix-run/react"

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

  return json({
    works: worksResp.data.works,
  })
}

export default function SensitiveCollection() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <CollectionArticle />
      <WorkList works={data.works} />
    </AppPage>
  )
}
