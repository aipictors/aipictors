import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  RequestArticleWork,
  RequestArticleWorkFragment,
} from "~/routes/($lang).creator.requests.$request/components/request-article-work"

export default function Route () {
  const data = useLoaderData<typeof loader>()

  if (!data || !("data" in data) || data.data === null) {
    return null
  }

  return (
    <article className="container-shadcn-ui">
      <div className="space-y-4">
        {data.data.promptonRequest?.deliverables.map((work) => (
          <RequestArticleWork key={work.id} work={work} />
        ))}
      </div>
    </article>
  )
}

export async function loader(props: LoaderFunctionArgs) {
  if (!props.params.request) {
    throw new Response(null, { status: 404 })
  }

  const result = await loaderClient.query({
    query: LoaderQuery,
    variables: {
      id: props.params.request,
    },
  })

  if (result.error) {
    throw result.error
  }

  return {
    data: result.data,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.short,
})

export const MetaFragment = graphql(
  `fragment Meta on PromptonRequestNode {
    id
    recipient {
      id
      name
    }
  }`,
)

const LoaderQuery = graphql(
  `query LoaderQuery($id: ID!) {
    promptonRequest(id: $id) {
      id
      ...Meta
      deliverables {
        id
        ...RequestArticleWork
      }
    }
  }`,
  [MetaFragment, RequestArticleWorkFragment],
)
