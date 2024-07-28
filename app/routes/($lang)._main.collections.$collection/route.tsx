import { AppPage } from "@/components/app/app-page"
import { ParamsError } from "@/errors/params-error"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { createClient } from "@/lib/client"
import { CollectionArticle } from "@/routes/($lang)._main.collections.$collection/components/collection-article"
import { WorkList } from "@/routes/($lang)._main.posts._index/components/work-list"
import { json, useLoaderData } from "@remix-run/react"
import { useParams } from "@remix-run/react"
import { graphql } from "gql.tada"

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

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
