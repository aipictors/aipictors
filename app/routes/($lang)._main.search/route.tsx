import { createClient } from "~/lib/client"
import { SearchHeader } from "~/routes/($lang)._main.search/components/search-header"
import { WorkList } from "~/routes/($lang)._main.posts._index/components/work-list"
import { json, redirect, useLoaderData } from "@remix-run/react"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { graphql } from "gql.tada"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { ModelList } from "~/routes/($lang)._main.posts._index/components/model-list"

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const tag = url.searchParams.get("tag")

  if (tag) {
    return redirect(`/tags/${tag}`, {
      status: 302,
    })
  }

  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 16,
      where: {
        ratings: ["G"],
        orderBy: "LIKES_COUNT",
      },
    },
  })

  return json({
    worksResp,
  })
}

export default function Search() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      {/* <RelatedTagList /> */}
      {/* <RelatedModelList /> */}
      <div className="m-auto md:max-w-96">
        <SearchHeader />
      </div>
      <h2 className="font-bold">モデル一覧</h2>
      <ModelList />
      <h2 className="font-bold">人気作品</h2>
      <WorkList works={data.worksResp.data.works ?? []} />
    </>
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
