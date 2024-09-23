import type { LoaderFunctionArgs } from "@remix-run/cloudflare"
import { json, type MetaFunction, useLoaderData } from "@remix-run/react"
import { graphql, readFragment } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  RequestArticleWork,
  RequestArticleWorkFragment,
} from "~/routes/($lang).creator.requests.$request/components/request-article-work"
import { createMeta } from "~/utils/create-meta"

export default function Route() {
  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

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

  return json(result.data, {
    headers: { "Cache-Control": config.cacheControl.short },
  })
}

export const meta: MetaFunction<typeof loader> = (args) => {
  if (args.data === undefined || args.data === null) return []

  const meta = readFragment(MetaFragment, args.data.promptonRequest)

  if (meta === null) return []

  return createMeta(
    META.CREATOR,
    {
      title: `${meta.recipient.name}さんへのリクエスト`,
      enTitle: `Request for ${meta.recipient.name}`,
      description: `リクエスト「${meta.recipient.id}」は${meta.recipient.name}さんへのリクエストです。`,
      enDescription: `Request "${meta.recipient.id}" is a request for ${meta.recipient.name}.`,
    },
    args.params.lang,
  )
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
