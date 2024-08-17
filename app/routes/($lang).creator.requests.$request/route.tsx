import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import {
  RequestArticlePost,
  RequestArticlePostFragment,
} from "~/routes/($lang).creator.requests.$request/components/request-article"

export default function Route() {
  const data = useLoaderData<typeof loader>()

  return (
    <article className="container-2">
      <div className="space-y-4">
        {data.promptonRequest?.deliverables.map((work) => (
          <RequestArticlePost key={work.id} work={work} />
        ))}
      </div>
    </article>
  )
}

export async function loader(props: LoaderFunctionArgs) {
  if (props.params.request === undefined) {
    throw new Response(null, { status: 404 })
  }

  const result = await loaderClient.query({
    query: LoaderQuery,
    variables: {
      id: props.params.request,
    },
  })

  if (result.error !== undefined) {
    throw result.error
  }

  return json(result.data)
}

const LoaderQuery = graphql(
  `query LoaderQuery($id: ID!) {
    promptonRequest(id: $id) {
      id
      deliverables {
        id
        ...RequestArticlePost
      }
    }
  }`,
  [RequestArticlePostFragment],
)
