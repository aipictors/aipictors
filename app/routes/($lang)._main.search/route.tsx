import { AppPage } from "@/_components/app/app-page"
import { createClient } from "@/_lib/client"
import { RelatedModelList } from "@/routes/($lang)._main.search/_components/related-model-list"
import { RelatedTagList } from "@/routes/($lang)._main.search/_components/related-tag-list"
import { SearchHeader } from "@/routes/($lang)._main.search/_components/search-header"
import { WorkList } from "@/routes/($lang)._main.posts._index/_components/work-list"
import { json, useLoaderData } from "@remix-run/react"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
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

export default function Search() {
  const data = useLoaderData<typeof loader>()

  return (
    <AppPage>
      <RelatedTagList />
      <RelatedModelList />
      <SearchHeader />
      <WorkList works={data.worksResp.data.works ?? []} />
    </AppPage>
  )
}

export const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
