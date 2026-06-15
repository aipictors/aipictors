import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { useLoaderData, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { fetchSupportPeriodRanking } from "~/lib/server/support-rankings.server"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import { RankingUserList } from "~/routes/($lang)._main.rankings._index/components/ranking-user-list"
import { FeaturedRankingsShowcase } from "~/routes/($lang)._main.rankings._index/components/featured-rankings-showcase"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { SupportPeriodRankingList } from "~/routes/($lang)._main.rankings._index/components/support-period-ranking-list"
import { AiEvaluationRankingListItemFragment } from "~/routes/($lang)._main.ai-rankings._index/components/ai-evaluation-ranking-work-list"
import { createMeta } from "~/utils/create-meta"

export async function loader(props: LoaderFunctionArgs) {
  const url = new URL(props.request.url)
  const rankingFamily =
    url.searchParams.get("family") === "support" ? "support" : "standard"

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
  let supportReceived = null
  let supportSent = null

  if (rankingFamily === "support") {
    for (let offset = 0; offset < 30; offset += 1) {
      const targetDate = new Date(initialDate)
      targetDate.setDate(initialDate.getDate() - offset)

      year = targetDate.getFullYear()
      month = targetDate.getMonth() + 1
      day = targetDate.getDate()

      const periodKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

      ;[supportReceived, supportSent] = await Promise.all([
        fetchSupportPeriodRanking({
          context: props.context,
          kind: "received",
          period: "daily",
          periodKey,
          limit: 100,
        }).catch(() => null),
        fetchSupportPeriodRanking({
          context: props.context,
          kind: "sent",
          period: "daily",
          periodKey,
          limit: 100,
        }).catch(() => null),
      ])

      if (
        (supportReceived?.items.length ?? 0) > 0 ||
        (supportSent?.items.length ?? 0) > 0
      ) {
        break
      }
    }

    return {
      rankingFamily,
      year,
      month,
      day,
      workAwards: null,
      aiRankings: null,
      supportReceived,
      supportSent,
    }
  }

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
    rankingFamily,
    year,
    month,
    day,
    workAwards: workAwardsResp,
    aiRankings: aiRankingsResp,
    supportReceived: null,
    supportSent: null,
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
  const rankingFamily: "standard" | "support" =
    data.rankingFamily === "support" ? "support" : "standard"

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

  const handleRankingFamilyChange = (family: "standard" | "support") => {
    const newSearchParams = new URLSearchParams(searchParams)
    if (family === "support") {
      newSearchParams.set("family", "support")
      newSearchParams.delete("type")
    } else {
      newSearchParams.delete("family")
    }
    setSearchParams(newSearchParams, {
      replace: true,
      preventScrollReset: true,
    })
  }

  // デイリーランキングかどうかを判定
  const isDaily = data.day !== null && data.day !== undefined

  return (
    <>
      {data && (
        <div className="space-y-6 pb-8">
          {rankingFamily === "standard" && data.workAwards && data.aiRankings && (
            <FeaturedRankingsShowcase
              standardRankings={data.workAwards.data.workAwards}
              aiRankings={data.aiRankings.data.aiEvaluationWorkRankings}
            />
          )}
          <RankingHeader
            year={data.year}
            month={data.month}
            day={data.day}
            weekIndex={null}
            rankingType={isDaily && rankingFamily === "standard" ? rankingType : undefined}
            onRankingTypeChange={isDaily && rankingFamily === "standard" ? handleRankingTypeChange : undefined}
            rankingFamily={rankingFamily}
            onRankingFamilyChange={handleRankingFamilyChange}
          />
          {rankingFamily === "support" ? (
            <SupportPeriodRankingList
              receivedRanking={data.supportReceived}
              sentRanking={data.supportSent}
              periodLabel="日間"
            />
          ) : rankingType === "users" && isDaily ? (
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
