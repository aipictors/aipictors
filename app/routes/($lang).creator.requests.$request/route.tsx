import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, type MetaFunction, useLoaderData } from "@remix-run/react"
import { graphql, readFragment } from "gql.tada"
import { loaderClient } from "~/lib/loader-client"
import {
  RequestArticleWork,
  RequestArticleWorkFragment,
} from "~/routes/($lang).creator.requests.$request/components/request-article-work"

export default function Route() {
  const data = useLoaderData<typeof loader>()

  return (
    <article className="container-shadcn-ui">
      <div className="space-y-4">
        {data.promptonRequest?.deliverables.map((work) => (
          <RequestArticleWork key={work.id} work={work} />
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

export const meta: MetaFunction<typeof loader> = (args) => {
  if (args.data === undefined) return []

  const meta = readFragment(MetaFragment, args.data.promptonRequest)

  if (meta === null) return []

  return [
    {
      title: `${meta.recipient.name}さんへのリクエスト`,
      description: `リクエスト「${meta.recipient.id}」は${meta.recipient.name}さんへのリクエストです。`,
    },
  ]
}

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
