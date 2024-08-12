import { ParamsError } from "~/errors/params-error"
import { partialWorkFieldsFragment } from "~/graphql/fragments/partial-work-fields"
import { createClient } from "~/lib/client"
import { TagWorkSection } from "~/routes/($lang)._main.tags._index/components/tag-work-section"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  const client = createClient()

  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

  const url = new URL(props.request.url)
  const page = url.searchParams.get("page")
    ? Number.parseInt(url.searchParams.get("page") as string) > 100
      ? 0
      : Number.parseInt(url.searchParams.get("page") as string)
    : 0

  const isSensitive = url.searchParams.get("sensitive") === "1"

  const worksResp = await client.query({
    query: tagWorksAndCountQuery,
    variables: {
      offset: page * 32,
      limit: 32,
      where: {
        search: decodeURIComponent(props.params.tag),
        orderBy: "LIKES_COUNT",
        isSensitive: isSensitive,
      },
    },
  })

  return json({
    tag: decodeURIComponent(props.params.tag),
    works: worksResp.data.works,
    worksCount: worksResp.data.worksCount,
    page: page,
    isSensitive: isSensitive,
  })
}

export default function Tag() {
  const params = useParams()

  if (params.tag === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <>
      <TagWorkSection
        works={data.works}
        worksCount={data.worksCount}
        tag={decodeURIComponent(params.tag)}
        page={data.page}
        isSensitive={data.isSensitive}
      />
    </>
  )
}

const tagWorksAndCountQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
    worksCount(where: $where)
  }`,
  [partialWorkFieldsFragment],
)

export const tagWorksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...PartialWorkFields
    }
  }`,
  [partialWorkFieldsFragment],
)
