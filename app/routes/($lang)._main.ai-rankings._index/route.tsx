import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { createMeta } from "~/utils/create-meta"
import {
  AiEvaluationRankingListItemFragment,
  AiEvaluationRankingWorkList,
} from "./components/ai-evaluation-ranking-work-list"

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

export default function AiEvaluationRankingsIndex() {
  const data = useLoaderData<typeof loader>()

  return (
    <>
      <RankingHeader
        year={data.year}
        month={data.month}
        day={data.day}
        weekIndex={null}
        pathnamePrefix="/ai-rankings"
      />
      <div className="mx-auto mb-6 max-w-6xl rounded-2xl border border-amber-200/60 bg-amber-50/80 p-4 text-amber-900 text-sm dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-100">
        AI評価ランキングの入賞回数は通常の入賞数には含まれません。将来のアチーブメント集計用に別枠で記録されます。
      </div>
      <AiEvaluationRankingWorkList
        year={data.year}
        month={data.month}
        day={data.day}
        weekIndex={null}
        rankings={data.rankings.data.aiEvaluationWorkRankings}
      />
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