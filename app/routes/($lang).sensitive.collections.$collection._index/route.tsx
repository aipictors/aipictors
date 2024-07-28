import { AppPage } from "@/components/app/app-page"
import { partialWorkFieldsFragment } from "@/graphql/fragments/partial-work-fields"
import { createClient } from "@/lib/client"
import { CollectionArticle } from "@/routes/($lang)._main.collections.$collection/components/collection-article"
import { WorkList } from "@/routes/($lang)._main.posts._index/components/work-list"
import { json, useLoaderData } from "@remix-run/react"
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

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
