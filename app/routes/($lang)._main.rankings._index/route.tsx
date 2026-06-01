import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { RankingUserList } from "~/routes/($lang)._main.rankings._index/components/ranking-user-list"
import { FeaturedRankingsShowcase } from "~/routes/($lang)._main.rankings._index/components/featured-rankings-showcase"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { AiEvaluationRankingListItemFragment } from "~/routes/($lang)._main.ai-rankings._index/components/ai-evaluation-ranking-work-list"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  // 昨日の日付を取得
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
  let workAwardsResp
  let aiRankingsResp

  for (let offset = 0; offset < 7; offset += 1) {
    const targetDate = new Date(initialDate)
    targetDate.setDate(initialDate.getDate() - offset)

    year = targetDate.getFullYear()
    month = targetDate.getMonth() + 1
    day = targetDate.getDate()

    const variables = {
      offset: 0,
      limit: 200,
      where: {
        year,
        month,
        day,
      },
    }

    ;[workAwardsResp, aiRankingsResp] = await Promise.all([
      loaderClient.query({
        query: workAwardsQuery,
        variables,
      }),
      loaderClient.query({
        query: aiEvaluationWorkRankingsQuery,
        variables,
      }),
    ])

    if (
      workAwardsResp.data.workAwards.length > 0 ||
      aiRankingsResp.data.aiEvaluationWorkRankings.length > 0
    ) {
      break
    }
  }

  return {
    year,
    month,
    day,
    workAwards: workAwardsResp,
    aiRankings: aiRankingsResp,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.RANKINGS, undefined, props.params.lang)
}

/**
 * ランキングの履歴
 */
export default function Rankings() {
  const data = useLoaderData<typeof loader>()
  const [searchParams, setSearchParams] = useSearchParams()

  // URL パラメータから直接状態を取得（useState は使わない）
  const typeParam = searchParams.get("type")
  const rankingType: "works" | "users" =
    typeParam === "users" ? "users" : "works"

  // ランキングタイプが変更された時のハンドラー
  const handleRankingTypeChange = (type: "works" | "users") => {
    // URLパラメータを更新
    const newSearchParams = new URLSearchParams(searchParams)
    if (type === "users") {
      newSearchParams.set("type", "users")
    } else {
      newSearchParams.delete("type")
    }
    setSearchParams(newSearchParams, {
      replace: true,
      preventScrollReset: true,
    }) // replace: true で履歴を置き換え
  }

  // デイリーランキングかどうかを判定
  const isDaily = data.day !== null && data.day !== undefined

  return (
    <>
      {data && (
        <div className="space-y-6 pb-8">
          <FeaturedRankingsShowcase
            standardRankings={data.workAwards.data.workAwards}
            aiRankings={data.aiRankings.data.aiEvaluationWorkRankings}
          />
          <RankingHeader
            year={data.year}
            month={data.month}
            day={data.day}
            weekIndex={null}
            rankingType={isDaily ? rankingType : undefined}
            onRankingTypeChange={isDaily ? handleRankingTypeChange : undefined}
          />
          {rankingType === "users" && isDaily ? (
            <RankingUserList
              year={data.year}
              month={data.month}
              day={data.day}
            />
          ) : (
            <RankingWorkList
              year={data.year}
              month={data.month}
              day={data.day}
              awards={data.workAwards.data.workAwards}
              weekIndex={null}
            />
          )}
        </div>
      )}
    </>
  )
}

const workAwardsQuery = graphql(
  `query WorkAwards($offset: Int!, $limit: Int!, $where: WorkAwardsWhereInput!) {
    workAwards(offset: $offset, limit: $limit, where: $where) {
      ...WorkAwardListItem
    }
  }`,
  [WorkAwardListItemFragment],
)

const aiEvaluationWorkRankingsQuery = graphql(
  `query AiEvaluationWorkRankingsForShowcase($offset: Int!, $limit: Int!, $where: AiEvaluationWorkRankingsWhereInput!) {
    aiEvaluationWorkRankings(offset: $offset, limit: $limit, where: $where) {
      ...AiEvaluationRankingListItem
    }
  }`,
  [AiEvaluationRankingListItemFragment],
)
