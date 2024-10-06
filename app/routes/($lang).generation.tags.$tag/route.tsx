import { ParamsError } from "~/errors/params-error"
import { loaderClient } from "~/lib/loader-client"
import {
  TagReferencedWorkSection,
  TagWorkFragment,
} from "~/routes/($lang).generation.tags.$tag/components/tag-referenced-work-section"
import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useParams } from "react-router"
import { useLoaderData } from "react-router"
import { graphql } from "gql.tada"
import { checkLocaleRedirect } from "~/utils/check-locale-redirect"

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.tag === undefined) {
    throw new Response(null, { status: 404 })
  }

  const redirectResponse = checkLocaleRedirect(props.request)

  if (redirectResponse) {
    return redirectResponse
  }

  const worksResp = await loaderClient.query({
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
    throw ParamsError()
  }

  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  return (
    <TagReferencedWorkSection
      works={data.works}
      title={decodeURIComponent(params.tag)}
    />
  )
}

const worksQuery = graphql(
  `query Works($offset: Int!, $limit: Int!, $where: WorksWhereInput) {
    works(offset: $offset, limit: $limit, where: $where) {
      ...TagWork
    }
  }`,
  [TagWorkFragment],
)
