import { ParamsError } from "@/_errors/params-error"
import { partialWorkFieldsFragment } from "@/_graphql/fragments/partial-work-fields"
import { createClient } from "@/_lib/client"
import { TagReferencedWorkSection } from "@/routes/($lang).generation.tags.$tag/_components/tag-referenced-work-section"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "@remix-run/react"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

  const client = createClient()

  const worksResp = await client.query({
    query: worksQuery,
    variables: {
      offset: 0,
      limit: 32,
      where: {
        tagNames: [decodeURIComponent(props.params.tag)],
        isFeatured: true,
        hasPrompt: true,
      },
    },
  })

  return json({
    works: worksResp.data.works,
    tag: props.params.tag,
  })
}

export default function GenerationTag() {
  const params = useParams()

  if (params.tag === undefined) {
    throw new ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  return (
    <TagReferencedWorkSection
      works={data.works}
      title={decodeURIComponent(params.tag)}
    />
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
