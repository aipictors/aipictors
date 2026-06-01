import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import { useLoaderData, useParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { createMeta } from "~/utils/create-meta"
import { getFutureRankingRedirectPath } from "~/utils/rankings/future-ranking-redirect"
import {
  AiEvaluationRankingListItemFragment,
  AiEvaluationRankingWorkList,
} from "~/routes/($lang)._main.ai-rankings._index/components/ai-evaluation-ranking-work-list"

export async function loader(props: LoaderFunctionArgs) {
  if (
    props.params.year === undefined ||
    props.params.month === undefined ||
    props.params.day === undefined
  ) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)
  const month = Number.parseInt(props.params.month)
  const day = Number.parseInt(props.params.day)

  const redirectPath = getFutureRankingRedirectPath(props.request.url, {
    kind: "daily",
    year,
    month,
    day,
    pathnamePrefix: "/ai-rankings",
  })

  if (redirectPath) {
    return redirect(redirectPath, { status: 302 })
  }

  const rankingsResp = await loaderClient.query({
    query: aiEvaluationWorkRankingsQuery,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year,
        month,
        day,
      },
    },
  })

  return {
    year,
    month,
    day,
    rankings: rankingsResp,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.AI_RANKINGS_DAY, undefined, props.params.lang)
}

export default function AiEvaluationDailyRankings() {
  const params = useParams()
  const data = useLoaderData<typeof loader>()

  if (
    params.year === undefined ||
    params.month === undefined ||
    params.day === undefined
  ) {
    return null
  }

  return (
    <>
      <div className="space-y-6 pb-8">
        <RankingHeader
          year={data.year}
          month={data.month}
          day={data.day}
          weekIndex={null}
          pathnamePrefix="/ai-rankings"
        />
        <AiEvaluationRankingWorkList
          year={data.year}
          month={data.month}
          day={data.day}
          weekIndex={null}
          rankings={data.rankings.data.aiEvaluationWorkRankings}
        />
      </div>
    </>
  )
}

const aiEvaluationWorkRankingsQuery = graphql(
  `query AiEvaluationWorkRankingsDay($offset: Int!, $limit: Int!, $where: AiEvaluationWorkRankingsWhereInput!) {
    aiEvaluationWorkRankings(offset: $offset, limit: $limit, where: $where) {
      ...AiEvaluationRankingListItem
    }
  }`,
  [AiEvaluationRankingListItemFragment],
)