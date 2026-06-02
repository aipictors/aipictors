import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { FeaturedRankingsShowcase } from "~/routes/($lang)._main.rankings._index/components/featured-rankings-showcase"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { createMeta } from "~/utils/create-meta"
import {
  AiEvaluationRankingListItemFragment,
  AiEvaluationRankingWorkList,
} from "./components/ai-evaluation-ranking-work-list"

export async function loader(props: LoaderFunctionArgs) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const initialDate = new Date(
    props.params.year && props.params.month && props.params.day
      ? Number.parseInt(props.params.year)
      : yesterday.getFullYear(),
    props.params.year && props.params.month && props.params.day
      ? Number.parseInt(props.params.month) - 1
      : yesterday.getMonth(),
    props.params.year && props.params.month && props.params.day
      ? Number.parseInt(props.params.day)
      : yesterday.getDate(),
  )

  let year = initialDate.getFullYear()
  let month = initialDate.getMonth() + 1
  let day = initialDate.getDate()
  let rankingsResp

  for (let offset = 0; offset < 7; offset += 1) {
    const targetDate = new Date(initialDate)
    targetDate.setDate(initialDate.getDate() - offset)

    year = targetDate.getFullYear()
    month = targetDate.getMonth() + 1
    day = targetDate.getDate()

    rankingsResp = await loaderClient.query({
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

    if (rankingsResp.data.aiEvaluationWorkRankings.length > 0) {
      break
    }
  }

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

export default function AiEvaluationRankingsIndex() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <div className="space-y-6 pb-8">
        <FeaturedRankingsShowcase
          standardRankings={[]}
          aiRankings={data.rankings.data.aiEvaluationWorkRankings}
        />
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
  `query AiEvaluationWorkRankingsIndex($offset: Int!, $limit: Int!, $where: AiEvaluationWorkRankingsWhereInput!) {
    aiEvaluationWorkRankings(offset: $offset, limit: $limit, where: $where) {
      ...AiEvaluationRankingListItem
    }
  }`,
  [AiEvaluationRankingListItemFragment],
)