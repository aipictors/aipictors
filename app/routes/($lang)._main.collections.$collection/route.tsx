import { AppPage } from "@/_components/app/app-page"
import { ParamsError } from "@/_errors/params-error"
import { worksQuery } from "@/_graphql/queries/work/works"
import { createClient } from "@/_lib/client"
import { CollectionArticle } from "@/routes/($lang)._main.collections.$collection/_components/collection-article"
import { WorkList } from "@/routes/($lang)._main.posts._index/_components/work-list"
import { json, useLoaderData } from "@remix-run/react"
import { useParams } from "@remix-run/react"

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
    worksResp,
  })
}

/**
 * コレクションの詳細
 */
export default function Collections() {
  const params = useParams()

  if (params.collection === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <CollectionArticle />
      <WorkList works={data.worksResp.data.works ?? []} />
    </AppPage>
  )
}
