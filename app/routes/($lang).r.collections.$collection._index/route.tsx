import { loaderClient } from "~/lib/loader-client"
import {
  WorkList,
  WorkListItemFragment,
} from "~/routes/($lang)._main.posts._index/components/work-list"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader() {
  const worksResp = await loaderClient.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {},
    },
  })

  return {
    works: worksResp.data.works,
  }
}

export default function SensitiveCollection() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      {/* <CollectionArticle /> */}
      <WorkList works={data.works} />
    </>
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...WorkListItem
    }
  }`,
  [WorkListItemFragment],
)
