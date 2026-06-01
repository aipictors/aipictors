import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import {
  AiEvaluationRankingListItemFragment,
  AiEvaluationRankingWorkList,
} from "~/routes/($lang)._main.ai-rankings._index/components/ai-evaluation-ranking-work-list"
import { FeaturedRankingsShowcase } from "~/routes/($lang)._main.rankings._index/components/featured-rankings-showcase"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const year = props.params.year
    ? Number.parseInt(props.params.year)
    : yesterday.getFullYear()
  const month = props.params.month
    ? Number.parseInt(props.params.month)
    : yesterday.getMonth() + 1
  const day = props.params.day
    ? Number.parseInt(props.params.day)
    : yesterday.getDate()

  const rankingsResp = await loaderClient.query({
    query: aiEvaluationWorkRankingsQuery,
    variables: {
      offset: 0,
      limit: 200,
      where: {
        year,
        month,
        day,
        isSensitive: true,
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

export default function SensitiveAiEvaluationRankingsIndex() {
  const data = useLoaderData<typeof loader>()

  return (
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
        pathnamePrefix="/r/ai-rankings"
        defaultPathnamePrefix="/r/rankings"
        aiPathnamePrefix="/r/ai-rankings"
        showRankingFamilyToggle={true}
      />
      <AiEvaluationRankingWorkList
        year={data.year}
        month={data.month}
        day={data.day}
        weekIndex={null}
        rankings={data.rankings.data.aiEvaluationWorkRankings}
      />
    </div>
  )
}

const aiEvaluationWorkRankingsQuery = graphql(
  `query SensitiveAiEvaluationWorkRankingsIndex($offset: Int!, $limit: Int!, $where: AiEvaluationWorkRankingsWhereInput!) {
    aiEvaluationWorkRankings(offset: $offset, limit: $limit, where: $where) {
      ...AiEvaluationRankingListItem
    }
  }`,
  [AiEvaluationRankingListItemFragment],
)