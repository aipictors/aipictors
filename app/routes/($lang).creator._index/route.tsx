import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { type MetaFunction, useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  HomeRequestCard,
  HomeRequestCardFragment,
} from "~/routes/($lang).creator._index/components/home-request-card"
import { createMeta } from "~/utils/create-meta"

/**
 * 支援リクエスト
 */
export default function Route () {
  const data = useLoaderData<typeof loader>()

  if (data === null) {
    return null
  }

  return (
    <div className="container-shadcn-ui">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
        {data.data.requests.map((request) => (
          <HomeRequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  )
}

export async function loader(_props: LoaderFunctionArgs) {
  const result = await loaderClient.query({
    query: LoaderQuery,
  })

  if (result.error !== undefined) {
    throw result.error
  }

  return {
    data: result.data,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.home,
})

export const meta: MetaFunction<typeof loader> = () => {
  return createMeta(META.CREATOR)
}

const LoaderQuery = graphql(
  `query LoaderQuery {
    requests(offset: 0, limit: 16, where: {}) {
      ...HomeRequestCard
    }
  }`,
  [HomeRequestCardFragment],
)
