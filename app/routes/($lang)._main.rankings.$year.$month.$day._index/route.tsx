import type {
  HeadersFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare"
import { redirect } from "@remix-run/cloudflare"
import { useLoaderData, useParams, useSearchParams } from "@remix-run/react"
import { graphql } from "gql.tada"
import { config, META } from "~/config"
import { loaderClient } from "~/lib/loader-client"
import { fetchSupportPeriodRanking } from "~/lib/server/support-rankings.server"
import { RankingHeader } from "~/routes/($lang)._main.rankings._index/components/ranking-header"
import {
  RankingWorkList,
  WorkAwardListItemFragment,
} from "~/routes/($lang)._main.rankings._index/components/ranking-work-list"
import { SupportPeriodRankingList } from "~/routes/($lang)._main.rankings._index/components/support-period-ranking-list"
import { createMeta } from "~/utils/create-meta"
import { getFutureRankingRedirectPath } from "~/utils/rankings/future-ranking-redirect"
import { RankingUserList } from "./components/ranking-user-list"

export async function loader(props: LoaderFunctionArgs) {
  // const redirectResponse = checkLocaleRedirect(props.request)

  // if (redirectResponse) {
  //   return redirectResponse
  // }

  if (props.params.year === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.month === undefined) {
    throw new Response(null, { status: 404 })
  }

  if (props.params.day === undefined) {
    throw new Response(null, { status: 404 })
  }

  const year = Number.parseInt(props.params.year)

  const month = Number.parseInt(props.params.month)

  const day = Number.parseInt(props.params.day)
  const rankingFamily =
    new URL(props.request.url).searchParams.get("family") === "support"
      ? "support"
      : "standard"

  const redirectPath = getFutureRankingRedirectPath(props.request.url, {
    kind: "daily",
    year,
    month,
    day,
    pathnamePrefix: "/rankings",
  })

  if (redirectPath) {
    return redirect(redirectPath, { status: 302 })
  }

  if (rankingFamily === "support") {
    const periodKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const [supportReceived, supportSent] = await Promise.all([
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

    return {
      rankingFamily,
      year,
      month,
      day,
      workAwards: null,
      supportReceived,
      supportSent,
    }
  }

  const workAwardsResp = await loaderClient.query({
    query: workAwardsQuery,
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
    rankingFamily,
    year,
    month,
    day,
    workAwards: workAwardsResp,
    supportReceived: null,
    supportSent: null,
  }
}

export const headers: HeadersFunction = () => ({
  "Cache-Control": config.cacheControl.oneDay,
})

export const meta: MetaFunction = (props) => {
  return createMeta(META.RANKINGS_DAY, undefined, props.params.lang)
}

/**
 * ある日のランキングの履歴
 */
export default function DayAwards() {
  const params = useParams()
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

  if (params.year === undefined) {
    return null
  }

  if (params.month === undefined) {
    return null
  }

  if (params.day === undefined) {
    return null
  }

  if (data === null) {
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
          rankingType={rankingFamily === "standard" ? rankingType : undefined}
          onRankingTypeChange={rankingFamily === "standard" ? handleRankingTypeChange : undefined}
          rankingFamily={rankingFamily}
          onRankingFamilyChange={handleRankingFamilyChange}
        />
        {rankingFamily === "support" ? (
          <SupportPeriodRankingList
            receivedRanking={data.supportReceived}
            sentRanking={data.supportSent}
            periodLabel="日間"
          />
        ) : rankingType === "users" ? (
          <RankingUserList year={data.year} month={data.month} day={data.day} />
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

